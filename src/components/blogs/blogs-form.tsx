import { getBlogsData } from "./fetch";
import BlogsClient from "./BlogsClient";

export async function BlogsForm({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  // ✅ Fetch blogs server-side
  const { data, totalPages } = await getBlogsData({
    page,
    limit,
    search,
  });

  // ✅ Pass blogs down to client component
  return (
    <BlogsClient
      initialData={data || []}
      page={page}
      totalPages={totalPages}
      search={search}
    />
  );
}
