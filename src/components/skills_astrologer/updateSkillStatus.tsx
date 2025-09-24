    "use client";
    import { useTransition, useState, useEffect } from "react";
    import { Switch } from "@/components/FormElements/switch";
    import { updateSkillStatus } from "./fetch";
    import toast from "react-hot-toast";
    import { el } from "date-fns/locale";

    interface Props {
        id: number;
        status: boolean;
        className?: string;
    }

    export const SkillStatusToggle = ({ id, status }: Props) => {
        const [isPending, startTransition] = useTransition();
        const [checked, setChecked] = useState(status);

        // 🔹 Sync with parent prop
        useEffect(() => {
            setChecked(status);
        }, [status]);

        const toggleLiveStatus = async (newValue: boolean) => {
            setChecked(newValue);
            const status = newValue;

            const res = await updateSkillStatus(id, status);

            if (res.success) {
                toast.success("Status updated successfully");
            } else {
                toast.error("Failed to update status");
                setChecked(!newValue); // Revert the change on failure
            }
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
