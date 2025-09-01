import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { getPages } from "./fetch";
import PageCard from "./PageCard"; // Client component

export async function PagesForm({}) {
  const { data} = await getPages();

  return (
    <div className="intro-y grid grid-cols-12 gap-6 mt-5 grid-table">
      {data.map((item: any, index: number) => (
        <PageCard key={item.id} item={item} />
      ))}
    </div>
  );
}
