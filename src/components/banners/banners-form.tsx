import Image from "next/image";
import { Edit, Trash2 } from "lucide-react"; // icon library (same as data-lucide)
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { getBanners } from "./fetch";
import { Calendar, Video, CheckSquare } from "lucide-react";
import { isValidImageUrl } from "../functions";

export async function BannersForm() {

  const { data,banner_types} = await getBanners();

  return (
      <div className="grid grid-cols-12 gap-6 mt-5 grid-table-without-search">
        {data.map((item: any, index: number) => (
          <div
            key={item.id}
            className="intro-y col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 bg-white"
          >
          <div className="box">
            <div className="p-5">
              <div className="relative h-40 2xl:h-56 image-fit rounded-md overflow-hidden before:block before:absolute before:w-full before:h-full before:top-0 before:left-0 before:z-10 before:bg-gradient-to-t before:from-black before:to-black/10">
                <Image
                  alt="Banner image"
                  src={
                        isValidImageUrl(item?.bannerImage)
                          ? `${process.env.NEXT_PUBLIC_BASEURL}${item.bannerImage}`
                          : "https://gyanitalk.com/build/assets/images/person.png"
                      }
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div className="text-slate-600 dark:text-slate-500 mt-5">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  From: {item.fromDate
                          ? dayjs(item.fromDate).format("DD-MMM-YYYY")
                        : "-"}
                </div>
                <div className="flex items-center mt-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  To: {item.toDate
                          ? dayjs(item.toDate).format("DD-MMM-YYYY")
                        : "-"}
                </div>
                <div className="flex items-center mt-2">
                  <Video className="w-4 h-4 mr-2" />
                    {
                      banner_types.find((bt: any) => bt.id === item.bannerTypeId)?.name || "N/A"
                    }
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex justify-center lg:justify-center items-center p-5 border-t border-slate-200/60 dark:border-darkmode-400">
              <button
                // onClick={() =>
                //   editBtn(
                //     item.id,
                //     item.bannerImage,
                //     item.fromDate,
                //     item.toDate,
                //     item.bannerTypeId
                //   )
                // }
                className="flex items-center mr-3 text-blue-600 hover:underline"
              >
                <CheckSquare className="w-4 h-4 mr-1" />Edit
              </button>

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
        </div>
    ))}
    </div>
  );
}

