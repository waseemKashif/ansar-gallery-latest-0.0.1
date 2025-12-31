"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

interface DeleteAllAlertProps {
    onConfirm: () => void;
    isPending: boolean;
    disabled: boolean;
}

export const DeleteAllAlert = ({
    onConfirm,
    isPending,
    disabled
}: DeleteAllAlertProps) => {
    return (
        <div className="inline-flex justify-end w-full border-t pt-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={disabled}>
                        Delete All
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your all items from your cart.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction type="submit" onClick={onConfirm}>
                            {isPending ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                "Continue"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
