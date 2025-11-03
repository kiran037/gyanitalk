"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import GlassSwitch from "@/components/GlassUI/GlassSwitch";
import { updateAstroguruNewsStatus } from "@/app/astrogurunews/fetch";

export default function NewsStatusToggle({
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

  const toggle = async (v: boolean) => {
    setChecked(v);
    const res = await updateAstroguruNewsStatus(id, v);
    if (res?.success) {
      toast("success", "Updated", "Status updated");
      onAfter?.();
    } else {
      toast("error", "Failed", "Update failed");
      setChecked(!v);
    }
  };

  return (
    <GlassSwitch
      checked={checked}
      onChange={(v) => startTransition(() => toggle(v))}
    />
  );
}
