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
      // Validate origin if possible, but strict validation might fail in dev/iframe
      try {
        if (typeof event.data !== 'string') return;
        const data = JSON.parse(event.data);

        console.log("PaymentIframe Message:", data);

        if (data.type === "cancel") {
          onClose();
        }
        if (data.type === "complete") {
          if (onComplete) onComplete(data.data);
        }
        if (data.type === "error" || data.type === "exception") {
          console.error("Payment Error:", data);
          // Optionally show error toast
        }

      } catch (e) {
        // Ignore non-JSON messages
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
