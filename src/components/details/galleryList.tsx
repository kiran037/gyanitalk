"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";
import { verifyGallery } from "../(astros)/astrologers/fetch";

export default function GalleryList({ gallery }: { gallery: any[] }) {
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const handleVerify = async (id: number, status: number) => {
    await verifyGallery({ id, status: status === 0 ? 1 : 0 });

    toast.success("Image verified!");

    setSelectedImage(null);
    location.reload();
  };


  const handleCancel = () => {
    setSelectedImage(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📸 Gallery</h2>

      {gallery.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6">
          No images found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map((img) => {
            const createdAt = img.created_at
              ? format(new Date(img.created_at), "dd MMM yyyy, hh:mm a")
              : "N/A";
            const isPending = img.status !== 1;
            const statusText = isPending ? "Pending" : "Approved";
            const statusColor = isPending
              ? "bg-yellow-100 text-yellow-600 border-yellow-300"
              : "bg-green-100 text-green-600 border-green-300";

            return (
              <div
                key={img.id}
                className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASEURL}/${img.image}`}
                  alt={`Astro Image ${img.id}`}
                  width={300}
                  height={300}
                  className="object-cover w-full h-52"
                />

                {/* Status & Date */}
                <div
                  className={`p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-sm ${isPending ? "cursor-pointer hover:bg-yellow-50" : ""
                    }`}
                  onClick={() => isPending && setSelectedImage(img)}
                >
                  <div
                    className={`inline-block px-2 py-0.5 text-xs rounded-full border ${statusColor}`}
                  >
                    {statusText}
                  </div>
                  <div className="mt-2 text-gray-500 dark:text-gray-400 text-xs">{createdAt}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popup Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Verify Image
            </h3>
            <Image
              src={`${process.env.NEXT_PUBLIC_BASEURL}/${selectedImage.image}`}
              alt="Selected"
              width={0}
              height={0}
              sizes="100vw"
              className="rounded-md object-contain max-h-[70vh] w-auto mx-auto mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(selectedImage.id, selectedImage.status)}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
