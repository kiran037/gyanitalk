"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateVerifyStatus } from "./fetch";
import toast from "react-hot-toast";


interface Props {
    id: number;
    isVerified: boolean;
}

export const VerifyStatusToggle = ({ id, isVerified }: Props) => {
    const [open, setOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(isVerified);
    const [isPending, startTransition] = useTransition();



    const handleToggle = () => {
        startTransition(async () => {
            try {
                await updateVerifyStatus({ id, isVerified });

                setCurrentStatus(!currentStatus);
                setOpen(false);

                toast.success(
                    `Astrologer ${currentStatus ? "unverified" : "verified"} successfully!`
                );

            } catch (error) {
                toast.error("Something went wrong!");

            }
        });
    };

    return (
        <>
            <span
                onClick={() => setOpen(true)}
                className={cn(
                    "inline-flex items-center px-2 py-1 text-xs rounded-full font-semibold cursor-pointer",
                    currentStatus
                        ? "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300"
                )}
            >
                {currentStatus ? "Verified" : "Unverified"}
            </span>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-xl max-w-sm sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {currentStatus ? "Unverify Astrologer?" : "Verify Astrologer?"}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to {currentStatus ? "unverify" : "verify"} this astrologer?
                    </p>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button disabled={isPending} onClick={handleToggle}>
                            {isPending ? "Updating..." : currentStatus ? "Unverify" : "Verify"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
