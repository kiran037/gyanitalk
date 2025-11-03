// /src/app/(settings)/settings/page.tsx
import SettingsClient from "@/components/(settings)/settings/SettingsClient";

export default function Page() {
  // server component wrapper -> client logic lives in SettingsClient
  return <SettingsClient />;
}
