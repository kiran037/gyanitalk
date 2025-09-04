import Image from "next/image";
import { Edit, ExternalLink, Trash2 } from "lucide-react"; // icon library (same as data-lucide)
import { getVideos } from "./fetch";
import { isValidImageUrl } from "../functions";


export async function VideosForm() {

  const { data } = await getVideos();

  return (
    <div className="intro-y grid grid-cols-12 gap-6 mt-5 grid-table">
      {data.map((item: any, index: number) => (
        <div className="intro-y col-span-12 md:col-span-6 xl:col-span-4 box fitbox bg-white" key={item.id}>
          <div className="p-5 break-words">
            {/* Cover Image */}
            <div className="h-40 2xl:h-56 image-fit relative">
              <Image
                src={
                  isValidImageUrl(item?.coverImage)
                    ? `${process.env.NEXT_PUBLIC_BASEURL}${item.coverImage}`
                    : "https://gyanitalk.com/build/assets/images/person.png"
                }
                className="rounded-md object-cover"
                fill
                alt={(item.coverImage || "Ads Video image") + " Logo"}
              />
            </div>
            {/* Title */}
            <div className="text-slate-600 dark:text-slate-500 mt-2">{item.videoTitle}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-5 border-t border-slate-200">
            <a
              href={item.youtubeLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium ${item.youtubeLink
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open Link
            </a>
            <div className="ml-auto flex items-center gap-3">
              {/* <button
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button> */}
              {/* <button
                      onClick={() => {
                        setDeleteId(item.id);
                        setShowDelete(true);
                      }}
                      className="text-red-600 hover:underline text-sm flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                    <NewsStatusToggle id={item.id} status={item.isActive} /> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

