"use client";
import { useTransition, useState } from "react";
import { updateLiveStatus } from "./fetch";
import { Switch } from "@/components/FormElements/switch";

interface Props {
    id: number;
    isLiveOff: boolean;
}

export const LiveStatusToggle = ({ id, isLiveOff }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [checked, setChecked] = useState(isLiveOff);

    const toggleLiveStatus = async (newValue: boolean) => {
        setChecked(newValue);
        const status = newValue ? 0 : 1;

        await updateLiveStatus({ id, isLiveOff: status });
    };

    return (
        <Switch
            checked={checked}
            onCheckedChange={(val) =>
                startTransition(() => {
                    toggleLiveStatus(val);
                })
            }
            withIcon
            background="light"
        />
    );
};
