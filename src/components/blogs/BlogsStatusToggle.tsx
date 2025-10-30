"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import GlassSwitch from "@/components/GlassUI/GlassSwitch";
import { updateBlogsStatus } from "@/app/blogs/fetch";

export default function BlogsStatusToggle({
  id,
  status,
  onAfter,
}: {
  id: number;
  status: boolean;
  onAfter?: () => void;
}) {
  const toast = useToast();
  const [checked, setChecked] = useState(status);
  const [, startTransition] = useTransition();

  const toggle = async (val: boolean) => {
    setChecked(val);
    try {
      const res = await updateBlogsStatus(id, val);
      if (res?.success) {
        toast("success", "Updated", `Blog ${val ? "activated" : "deactivated"}.`);
        onAfter?.();
      } else {
        setChecked(!val);
        toast("error", "Error", "Failed to update status.");
      }
    } catch {
      setChecked(!val);
      toast("error", "Error", "Failed to update status.");
    }
  };

  return (
    <GlassSwitch
      checked={checked}
      onChange={(v) =>
        startTransition(() => {
          toggle(v);
        })
      }
    />
  );
}
