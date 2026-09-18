import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useOneSignal from "@/hooks/useOneSignal";

/** Confirms the OneSignal web integration, then asks for push permission. */
export default function OneSignalDialog() {
  const { showDialog, confirm } = useOneSignal();

  return (
    <Dialog open={showDialog} onOpenChange={(open) => !open && confirm()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Your OneSignal SDK integration is complete!</DialogTitle>
          <DialogDescription>
            You can now send Push Notifications &amp; In-App Messages through OneSignal. Tap below to
            enable push notifications.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="h-11 w-full" onClick={confirm}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}