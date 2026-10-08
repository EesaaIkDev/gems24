import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import Spinner from "@/components/common/Spinner";
import LoadError from "@/components/common/LoadError";
import useOfflineEntity from "@/hooks/useOfflineEntity";
import usePagedListings, { ON_MARKET } from "@/hooks/usePagedListings";
import LoadMore from "@/components/common/LoadMore";
import EmptyState from "@/components/common/EmptyState";
import FeedPost from "@/components/feed/FeedPost";
import ActivityStrip from "@/components/feed/ActivityStrip";
import SuggestedTraders from "@/components/feed/SuggestedTraders";
import FeedSearch from "@/components/feed/FeedSearch";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import { feedTraderIds, findConnection, listMyConnections } from "@/lib/network";
import { TIERS, tierRank } from "@/lib/gems";
import { Gem } from "lucide-react";

export default function Home() {
  const { trader: viewer, loading } = useCurrentTrader();
  const [connections, setConnections] = useState(null);
  const [networkEmpty, setNetworkEmpty] = useState(false);
  const [q, setQ] = useState("");

  const tradersQuery = useOfflineEntity(
    "Trader",
    () => base44.entities.Trader.filter({ account_type: "trader" }, "-created_date", 200),
    []
  );
  const traders = tradersQuery.rows || [];

  useEffect(() => {
    if (loading) return;
    if (!viewer?.id) return setConnections([]);
    listMyConnections(viewer.id).then(setConnections).catch(() => setConnections([]));
  }, [viewer?.id, loading]);

  const tradersById = useMemo(() => Object.fromEntries(traders.map((t) => [t.id, t])), [traders]);
  const networkIds = useMemo(
    () => (viewer?.id && connections ? feedTraderIds(connections, viewer.id) : []),
    [connections, viewer?.id]
  );
  const networkKey = networkIds.join(",");
  useEffect(() => setNetworkEmpty(false), [networkKey]);

  // Network traders' stones, newest first, filtered on the server. With no
  // network (or nothing listed by it yet) fall back to everyone else's newest.
  const useNetwork = networkIds.length > 0 && !networkEmpty;
  const feedQuery = useNetwork
    ? { ...ON_MARKET, trader_id: { $in: networkIds } }
    : { ...ON_MARKET, ...(viewer?.id ? { trader_id: { $ne: viewer.id } } : {}) };
  const feed = usePagedListings({ query: feedQuery, sort: "-created_date", enabled: connections !== null });
  const listings = feed.items;
  const error = feed.error;
  const reload = feed.refresh;

  useEffect(() => {
    if (useNetwork && listings && listings.length === 0 && !feed.hasMore) setNetworkEmpty(true);
  }, [useNetwork, listings, feed.hasMore]);

  // Free-text search over the pages loaded so far; LoadMore keeps fetching while it runs.
  const posts = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return listings || [];
    return (listings || []).filter((l) =>
      [l.gemstone_type, l.origin, l.color, String(l.weight_carats)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [listings, q]);

  const activity = useMemo(
    () =>
      networkIds
        .map((id) => tradersById[id])
        .filter((t) => t && t.subscription_tier && t.subscription_tier !== "none")
        .slice(0, 3)
        .map((t) => ({
          key: t.id,
          name: t.full_name,
          text: `is now ${TIERS[t.subscription_tier].label} tier`,
          to: `/trader/${t.id}`,
        })),
    [networkIds, tradersById]
  );

  const suggested = useMemo(
    () =>
      traders
        .filter((t) => t.id !== viewer?.id && !networkIds.includes(t.id))
        .sort((a, b) => tierRank(b.subscription_tier) - tierRank(a.subscription_tier))
        .slice(0, 8),
    [traders, networkIds, viewer?.id]
  );

  if (error) return <LoadError title="Couldn't load your feed" onRetry={reload} />;
  if (listings === null) return <Spinner />;

  return (
    <div className="pb-4">
      <div className="px-4 pt-5 pb-3">
        {/* Refreshing is pull-to-refresh only — see the app:refresh listener in useOfflineEntity. */}
        <h1 className="text-[1.625rem] font-bold leading-tight">Your feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {networkIds.length
            ? "Latest stones and updates from traders in your network."
            : "Newest stones from verified traders — tap Network to follow them."}
        </p>
      </div>

      <div className="px-4 pb-3">
        <FeedSearch value={q} onChange={setQ} />
      </div>

      <ActivityStrip items={activity} />

      {posts.length === 0 && !feed.hasMore ? (
        <EmptyState
          icon={Gem}
          title={q ? "No stones match your search" : "Nothing here yet"}
          description={
            q
              ? "Try another gemstone type, carat weight or origin."
              : "Once traders publish stones they'll show up in your feed."
          }
        />
      ) : (
        posts.map((l, i) => (
          <React.Fragment key={l.id}>
            <FeedPost
              listing={l}
              trader={tradersById[l.trader_id]}
              viewerId={viewer?.id}
              connection={
                viewer?.id ? findConnection(connections || [], viewer.id, l.trader_id) || null : null
              }
            />
            {i === 2 && <SuggestedTraders traders={suggested} />}
          </React.Fragment>
        ))
      )}

      <LoadMore hasMore={feed.hasMore} loading={feed.loadingMore} onLoad={feed.loadMore} watch={listings.length} />

      {posts.length <= 2 && <SuggestedTraders traders={suggested} />}
    </div>
  );
}