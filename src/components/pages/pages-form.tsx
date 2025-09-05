"use client";

import { useEffect, useState } from "react";
import { getPages } from "./fetch";
import PageCard from "./PageCard";

export default function PagesForm() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPages() {
    try {
      const res = await getPages();
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="intro-y grid grid-cols-12 gap-6 mt-5 grid-table">
        {loading ? (
          <p className="col-span-12 text-center text-gray-500">Loading...</p>
        ) : (
        data.map((item) => (
          <PageCard
            key={item.id}
            item={item}
            onUpdate={fetchPages} // ✅ pass refresh callback
          />
        ))
      )}
    </div>
  );
}
