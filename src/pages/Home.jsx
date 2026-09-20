import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import Spinner from "@/components/common/Spinner";
import LoadError from "@/components/common/LoadError";
import useOfflineEntity from "@/hooks/useOfflineEntity";
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
  const [connections, setConnections] = useState([]);
  const [q, setQ] = useState("");

  // Local-first: the IndexedDB mirror paints instantly, the network refreshes it.
  const listingsQuery = useOfflineEntity(
    "Listing",
    () => base44.entities.Listing.list("-created_date", 200),
    []
  );
  const tradersQuery = useOfflineEntity(
    "Trader",
    () => base44.entities.Trader.filter({ account_type: "trader" }, "-created_date", 200),
    []
  );

  const listings = listingsQuery.rows;
  const traders = tradersQuery.rows || [];
  const feedLoading = listings === null && listingsQuery.syncing;
  const error = listings === null && listingsQuery.stale;
  const reload = listingsQuery.refresh;

  useEffect(() => {
    if (viewer?.id) listMyConnections(viewer.id).then(setConnections).catch(() => setConnections([]));
  }, [viewer?.id]);

  const tradersById = useMemo(() => Object.fromEntries(traders.map((t) => [t.id, t])), [traders]);
  const networkIds = useMemo(
    () => (viewer?.id ? feedTraderIds(connections, viewer.id) : []),
    [connections, viewer?.id]
  );

  const posts = useMemo(() => {
    const available = (listings || []).filter((l) => l.status !== "sold" && l.trader_id !== viewer?.id);
    const mine = available.filter((l) => networkIds.includes(l.trader_id));
    // Nothing networked yet — show the newest stones so the feed is never empty.
    const base = mine.length ? mine : available;
    const s = q.trim().toLowerCase();
    if (!s) return base;
    return base.filter((l) =>
      [l.gemstone_type, l.origin, l.color, String(l.weight_carats)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [listings, networkIds, viewer?.id, q]);

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

  if (listings === null && (loading || feedLoading)) return <Spinner />;
  if (error) return <LoadError title="Couldn't load your feed" onRetry={reload} />;

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

      {posts.length === 0 ? (
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
                viewer?.id ? findConnection(connections, viewer.id, l.trader_id) || null : null
              }
            />
            {i === 2 && <SuggestedTraders traders={suggested} />}
          </React.Fragment>
        ))
      )}

      {posts.length <= 2 && <SuggestedTraders traders={suggested} />}
    </div>
  );
}