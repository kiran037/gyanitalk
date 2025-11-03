"use client";

import { useState, useTransition } from "react";
import GlassSwitch from "@/components/GlassUI/GlassSwitch";
import { useToast } from "@/components/Toast/ToastProvider";
import { updateVideosStatus } from "@/app/videos/fetch";

export default function VideoStatusToggle({
  id,
  status,
  onAfter,
}: {
  id: number;
  status: boolean;
  onAfter?: () => void;
}) {
  const toast = useToast();
  const [checked, setChecked] = useState(!!status);
  const [, startTransition] = useTransition();

  const toggle = async (v: boolean) => {
    setChecked(v);
    const res = await updateVideosStatus(id, v);
    if (res?.success) {
      toast("success", "Updated", "Status updated");
      onAfter?.();
    } else {
      toast("error", "Failed", "Could not update status");
      setChecked(!v);
    }
  };

  return (
    <GlassSwitch checked={checked} onChange={(v) => startTransition(() => toggle(v))} />
  );
}
