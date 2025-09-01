import Image from "next/image";
import { Edit, Trash2 } from "lucide-react"; // icon library (same as data-lucide)
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { getVideos } from "./fetch";
import { isValidImageUrl } from "../functions";

type VideoCardProps = {
  id: number;
  youtubeLink: string;
  coverImage: string;
  videoTitle: string;
  isActive: boolean;
  onEdit: (id: number, youtubeLink: string, coverImage: string, videoTitle: string) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, isActive: boolean) => void;
};

export async function VideosForm() {

  const { data} = await getVideos();

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

          {/* YouTube Link */}
          <a
            href={item.youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-medium text-base mt-5 text-blue-600 h-[60px]"
          >
            {item.youtubeLink}
          </a>

          {/* Title */}
          <div className="text-slate-600 dark:text-slate-500 mt-2">{item.videoTitle}</div>
        </div>
        <div className="flex justify-center items-center p-5 border-t border-slate-200/60 dark:border-darkmode-400">
          {/* Edit Button */}
          <button
            //onClick={() => onEdit(id, youtubeLink, coverImage, videoTitle)}
            className="flex items-center mr-3 text-blue-600 hover:underline"
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </button>

          {/* Delete Button */}
          <button
            //onClick={() => onDelete(id)}
            className="flex items-center mr-3 text-red-600 hover:underline"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </button>

          {/* Toggle Switch */}
          <div className="form-check form-switch flex justify-center w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0">
            <label className="form-switch relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={item.isActive == 1}
                //onChange={handleToggle}
              />
              <div className="w-11 h-6 rounded-full border border-gray-400 bg-gray-300 peer-checked:bg-[#164e61] peer-checked:border-[#164e61] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                <span className="ml-3 text-sm text-gray-700">
                  {item.isActive == 1 ? "Active" : "Inactive"}
                </span>
            </label>    
          </div>
        </div>
      </div> 
    ))}
    </div>
  );
}

