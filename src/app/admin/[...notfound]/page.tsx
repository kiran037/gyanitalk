// src/app/admin/[...notfound]/page.tsx
import { notFound } from "next/navigation";

export default function AdminCatchAll() {
  notFound();
}