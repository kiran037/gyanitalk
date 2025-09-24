    "use client";
    import { useTransition, useState } from "react";
    import { Switch } from "@/components/FormElements/switch";
    import { updateVideosStatus } from "./fetch";
    import toast from "react-hot-toast";
    import { el } from "date-fns/locale";

    interface Props {
        id: number;
        status: boolean;
    }

    export const VideosStatusToggle = ({ id, status }: Props) => {
        const [isPending, startTransition] = useTransition();
        const [checked, setChecked] = useState(status);

        const toggleLiveStatus = async (newValue: boolean) => {
            setChecked(newValue);
            const status = newValue;

            const res = await updateVideosStatus(id, status);

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
