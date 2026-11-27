import { isNative, shareApp } from "@/lib/despia";
import { cap } from "@/lib/gems";
import { absolute, listingPath } from "@/lib/seo";

/** Native share sheet in the app, Web Share in browsers, otherwise copy the link. */
export async function shareListing(listing) {
  const url = absolute(listingPath(listing));
  const text = `${listing.weight_carats} ct ${cap(listing.gemstone_type)} on Gems24`;
  if (isNative) {
    shareApp(text, url);
    return "shared";
  }
  if (navigator.share) {
    try {
      await navigator.share({ title: "Gems24", text, url });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}