import { Trash2, Eye, Clock, User } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { avatar } from "@/lib/images";

interface Story {
  id: number;
  astrologerId: string | null;
  mediaType: string | null;
  media: string | null;
  created_at: string;
  astrologer: {
    id: string;
    name: string;
    profileImage: string | null;
  } | null;
  viewCount: number;
  expiresAt: string;
  remainingTime: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  };
}

interface StoriesTableProps {
  stories: Story[];
  loading: boolean;
  onDelete: (id: number) => void;
}

export default function StoriesTable({ stories, loading, onDelete }: StoriesTableProps) {
  const formatTime = (hours: number, minutes: number) => {
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Eye className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Stories Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No active stories in the last 24 hours
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Media
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Astrologer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Expires In
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Posted
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {stories.map((story) => (
              <tr
                key={story.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {story.mediaType === "video" ? (
                      <video
                        src={avatar(story.media) || ""}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={avatar(story.media) || ""}
                        alt="Story"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar(story.astrologer?.profileImage)}
                      alt={story.astrologer?.name || "Unknown"}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {story.astrologer?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {story.astrologerId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {story.viewCount}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className={`font-medium ${
                      story.remainingTime.totalMinutes < 60
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {formatTime(story.remainingTime.hours, story.remainingTime.minutes)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(story.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4 text-red-500" />}
                      onClick={() => onDelete(story.id)}
                      ariaLabel="Delete"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}