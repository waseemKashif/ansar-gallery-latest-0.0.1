import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Assuming these exist

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onComplete?: (data: any) => void;
}

export const PaymentModal = ({ isOpen, onClose, sessionId, onComplete }: PaymentModalProps) => {

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Log everything for debugging
      console.log("PaymentModal received message:", {
        origin: event.origin,
        data: event.data,
        type: typeof event.data
      });

      // Validate origin if possible, but strict validation might fail in dev/iframe
      try {
        if (typeof event.data !== 'string') {
          console.log("Ignored non-string message");
          return;
        }

        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.log("Failed to parse message data as JSON", event.data);
          return;
        }

        console.log("Parsed PaymentIframe Message:", data);

        if (data.type === "cancel") {
          console.log("Payment cancelled");
          onClose(); // This trigger handleModalClose in parent
        }
        if (data.type === "complete") {
          console.log("Payment completed", data.data);
          if (onComplete) {
            console.log("Calling onComplete callback");
            onComplete(data.data);
          } else {
            console.warn("onComplete callback is missing!");
          }
        }
        if (data.type === "error" || data.type === "exception") {
          console.error("Payment Error:", data);
          // Optionally show error toast
        }

      } catch (e) {
        console.error("Error handling message:", e);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onClose, onComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-xl h-[80vh] overflow-hidden bg-white p-2 lg:p-4">
        <DialogTitle className="sr-only">Secure Payment</DialogTitle>

        <div className="flex-1 w-full h-full relative">
          <iframe
            src={`/payment?sessionId=${sessionId}`}
            className="w-full h-full border-none"
            title="Payment Checkout"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
