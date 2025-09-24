// components/CircleAvatar.tsx
"use client";
import Image from "next/image";
import { useState } from "react";

const fallback = "https://gyanitalk.com/build/assets/images/person.png";

export default function CircleAvatar({
  src,
  alt,
  size = 48,
  ring = true,
}: {
  src?: string;
  alt: string;
  size?: number;   // px
  ring?: boolean;  // show subtle ring
}) {
  const [img, setImg] = useState(src || fallback);
  return (
    <div
      style={{ width: size, height: size }}
      className={[
        "relative rounded-full overflow-hidden shrink-0",
        ring ? "ring-2 ring-white/70 dark:ring-white/10 shadow-sm" : "",
      ].join(" ")}
    >
      <Image
        src={img || fallback}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setImg(fallback)}
        priority={false}
      />
    </div>
  );
}
