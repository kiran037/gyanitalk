"use client";
import { useTransition, useState } from "react";
import { updateFeaturedStatus } from "./fetch";
import { Switch } from "@/components/FormElements/switch";

interface Props {
    id: number;
    featured: boolean;
}

export const FeaturedStatusToggle = ({ id, featured }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [checked, setChecked] = useState(featured);

    const toggleFeaturedStatus = async (newValue: boolean) => {
        setChecked(newValue);
        const status = newValue ? 1 : 0;

        await updateFeaturedStatus({ id, featured: status });
    };

    return (
        <Switch
            checked={checked}
            onCheckedChange={(val) =>
                startTransition(() => {
                    toggleFeaturedStatus(val);
                })
            }
            withIcon
            background="light"
        />
    );
};
