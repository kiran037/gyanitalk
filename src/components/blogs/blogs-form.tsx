import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
} from "@/components/ui-elements/dropdown"
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react"; // icon library (same as data-lucide)
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { getBlogs } from "./fetch";
import { isValidImageUrl } from "../functions";

export async function BlogsForm() {
  const { data} = await getBlogs();

  return (
    <div className="intro-y grid grid-cols-12 gap-6 mt-5 grid-table">
      {data.map((item: any, index: number) => (
        <div key={item.id} className="intro-y col-span-12 md:col-span-6 box">
          {/* Image or Video */}
          <div className="relative h-[320px] before:block before:absolute before:w-full before:h-full before:top-0 before:left-0 before:z-10 before:bg-gradient-to-t before:from-black/90 before:to-black/10 image-fit">
            {["jpg", "jpeg", "gif", "png"].includes(item.extension) ? (
              <img alt="Blog image" className="rounded-t-md w-full h-full object-cover" src={isValidImageUrl(item?.blogImage)
                                      ? `${process.env.NEXT_PUBLIC_BASEURL}${item.blogImage}`
                                      : "https://gyanitalk.com/build/assets/images/person.png"}/>
            ) : (
              <video
                controls
                className="absolute top-0 left-0 w-full h-full object-cover z-10 rounded-t-md"
              >
                <source src={isValidImageUrl(item?.blogImage)
                                      ? `${process.env.NEXT_PUBLIC_BASEURL}${item.blogImage}`
                                      : "https://gyanitalk.com/build/assets/images/person.png"} type="video/mp4" />
              </video>
            )}

            {/* Top Overlay */}
            <div className="absolute w-full flex items-center px-5 pt-6 z-10">
              <div className="ml-3 text-white mr-auto">
                <span className="font-medium">{item.author}</span>
                <div className="text-xs mt-0.5">
                  {item.postedOn && new Date(item.postedOn).toLocaleDateString("en-GB")}
                </div>
              </div>

              {/* Dropdown Actions */}
              <div className="dropdown ml-3 relative inline-block">
                <button className="bg-white/20 w-8 h-8 flex items-center justify-center rounded-full">
                  <i data-lucide="more-vertical" className="w-4 h-4 text-white">⋮</i>
                </button>
                {/* TODO: Replace with shadcn/ui Dropdown */}
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md p-2 z-30">
                  <button
                    //onClick={() => window.open(`/blogs/${item.id}`, "_blank")}
                    className="flex items-center w-full px-2 py-1 hover:bg-gray-100"
                  >
                    👁 View Blog
                  </button>
                  <button
                    //onClick={() => handleEdit(item)}
                    className="flex items-center w-full px-2 py-1 hover:bg-gray-100"
                  >
                    ✏ Edit Blog
                  </button>
                  <button
                    //onClick={() => handleDelete(item.id)}
                    className="flex items-center w-full px-2 py-1 hover:bg-gray-100 text-red-600"
                  >
                    🗑 Delete Blog
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="px-5 pt-5 text-slate-600 dark:text-slate-500">
            <h2 className="font-medium text-xl">{item.title}</h2>
          </div>

          {/* Description */}
          <div
            className="p-5 text-slate-600 dark:text-slate-500"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />

          {/* Footer */}
          <div className="px-5 pt-3 pb-5 border-t border-slate-200/60 dark:border-darkmode-400 intro-y flex flex-col sm:flex-row items-center">
            <div className="w-full flex text-slate-500 text-xs sm:text-sm">
              <div className="mr-2">
                Views: <span className="font-medium">{item.viewer ?? 0}</span>
              </div>
            </div>

           {/* Toggle Switch */}
          <div className="form-check form-switch flex justify-center w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0">
             <label className="form-switch relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                //checked={item.isActive == 1}
                //onChange={handleToggle}
              />
              <div className="w-11 h-6 rounded-full border border-gray-400 bg-gray-300 peer-checked:bg-[#164e61] peer-checked:border-[#164e61] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                <span className="ml-3 text-sm text-gray-700">
                  {/* {item.isActive == 1 ? "Active" : "Inactive"} */}
                </span>
            </label>    
          </div>
          </div>
        </div>
      ))}
    </div>

    // <div className="intro-y grid grid-cols-12 gap-6 mt-5 grid-table">
    //   {data.map((item: any, index: number) => (
    //   <div className="intro-y col-span-12 md:col-span-6 xl:col-span-4 box fitbox bg-white" key={item.id}>
    //     <div className="p-5 break-words">
    //       {/* Cover Image */}
    //       <div className="h-40 2xl:h-56 image-fit relative">
    //         <Image
    //           src={
    //             isValidImageUrl(item?.bannerImage)
    //               ? `${process.env.NEXT_PUBLIC_BASEURL}${item.bannerImage}`
    //               : "https://gyanitalk.com/build/assets/images/person.png"
    //           }
    //           className="rounded-md object-cover"
    //           fill
    //           alt={(item.bannerImage || "Ads Video image") + " Logo"}
    //         />
    //       </div>

    //       {/* YouTube Link */}
    //       <a
    //         href={item.link}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //         className="block font-medium text-base mt-5 text-blue-600 h-[60px]"
    //       >
    //         {item.link}
    //       </a><br></br>

    //       {/* Title */}
    //       <div className="text-slate-600 dark:text-slate-500 mt-2">
    //         <p><span className="font-bold">Channel:</span> {item.channel}</p>
    //         <p><span className="font-bold">News Date:</span>
    //         {item.newsDate
    //           ? dayjs(item.newsDate).format("DD MMM YYYY, hh:mm A")
    //         : "-"}</p>
    //         {item.description}
    //       </div>
    //     </div>
    //     <div className="flex justify-center items-center p-5 border-t border-slate-200/60 dark:border-darkmode-400">
    //       {/* Edit Button */}
    //       <button
    //         //onClick={() => onEdit(id, youtubeLink, coverImage, videoTitle)}
    //         className="flex items-center mr-3 text-blue-600 hover:underline"
    //       >
    //         <Edit className="w-4 h-4 mr-1" /> Edit
    //       </button>

    //       {/* Delete Button */}
    //       <button
    //         //onClick={() => onDelete(id)}
    //         className="flex items-center mr-3 text-red-600 hover:underline"
    //       >
    //         <Trash2 className="w-4 h-4 mr-1" /> Delete
    //       </button>

    //       {/* Toggle Switch */}
    //       <div className="form-check form-switch flex justify-center w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0">
    //         <label className="form-switch relative inline-flex cursor-pointer items-center">
    //           <input
    //             type="checkbox"
    //             className="peer sr-only"
    //             //checked={item.isActive == 1}
    //             //onChange={handleToggle}
    //           />
    //           <div className="w-11 h-6 rounded-full border border-gray-400 bg-gray-300 peer-checked:bg-[#164e61] peer-checked:border-[#164e61] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
    //             <span className="ml-3 text-sm text-gray-700">
    //               {item.isActive == 1 ? "Active" : "Inactive"}
    //             </span>
    //         </label>    
    //       </div>
    //     </div>
    //   </div> 
    // ))}
    // </div>
  );
}

