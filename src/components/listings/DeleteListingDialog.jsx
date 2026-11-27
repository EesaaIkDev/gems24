import React from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { deleteRecord } from "@/lib/offlineSync";
import { cap } from "@/lib/gems";

/** Confirms before permanently deleting the owner's listing. */
export default function DeleteListingDialog({ listing, open, onOpenChange }) {
  const { toast } = useToast();

  const remove = async () => {
    await deleteRecord("Listing", listing.id);
    window.dispatchEvent(new Event("app:refresh"));
    toast({ title: "Listing deleted" });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
          <AlertDialogDescription>
            {listing.weight_carats} ct {cap(listing.gemstone_type)} will be removed from the marketplace and feeds. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}