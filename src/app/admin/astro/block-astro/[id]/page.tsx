// app/astro/block-astro/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, Star, MessageCircle, PhoneCall, Calendar } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";
import Link from "next/link";

interface BlockDetail {
  blockInfo: {
    id: number;
    reason: string;
    created_at: string;
    astrologer: {
      id: string;
      name: string;
      email: string;
      contactNo: string;
      profileImage: string | null;

      // existing ID/string fields from DB
      primarySkill: string;
      allSkill: string;
      languageKnown: string;

      // NEW fields coming from API
      primarySkillName?: string | null;
      allSkillNames?: string[];
      languageNames?: string[];

      experienceInYears: number;
      charge: number;
      isVerified: boolean;
      totalOrder: number | null;
    } | null;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      contactNo: string | null;
      profile: string | null;
      gender: string | null;
      birthDate: string | null;
    } | null;
  };
  interactions: {
    totalChats: number;
    totalCalls: number;
    recentChats: any[];
    recentCalls: any[];
  };
  userReview: {
    id: string;
    rating: number;
    review: string;
    created_at: string;
  } | null;
}

export default function BlockedAstrologerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blockId = params.id as string;

  const [blockDetail, setBlockDetail] = useState<BlockDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const addToast = useToast();

  useEffect(() => {
    if (blockId) {
      fetchBlockDetail();
    }
  }, [blockId]);

  const fetchBlockDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/astrologers/block-astro/${blockId}`);
      const data = await response.json();

      if (data.success) {
        setBlockDetail(data.data);
      } else {
        addToast("error", "Error", data.error);
        router.push("/astro/block-astro");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch block details");
      router.push("/astro/block-astro");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blockDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Block details not found</p>
          <Link href="/astro/block-astro">
            <Button className="mt-4">Back to List</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { blockInfo, interactions, userReview } = blockDetail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/astro/block-astro">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} ariaLabel="Back" />
          </Link>
          <PageHeader
            title="Block Details"
            subtitle={`Blocked on ${formatDate(blockInfo.created_at)}`}
            badge={{ text: "BLOCK INFO", variant: "blue" }}
          />
        </div>

        {/* Main Info Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Astrologer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#FF6B35]" />
              Astrologer Information
            </h3>

            {blockInfo.astrologer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={avatar(blockInfo.astrologer.profileImage)}
                    alt={blockInfo.astrologer.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {blockInfo.astrologer.name}
                    </h4>
                    {blockInfo.astrologer.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full mt-1">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Experience</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {blockInfo.astrologer.experienceInYears} years
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Rate</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ₹{blockInfo.astrologer.charge}/min
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    {blockInfo.astrologer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    {blockInfo.astrologer.contactNo}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-gray-500 mb-1">Skills</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {blockInfo.astrologer.allSkillNames?.length
                      ? blockInfo.astrologer.allSkillNames.join(", ")
                      : blockInfo.astrologer.allSkill}
                  </p>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Languages</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {blockInfo.astrologer.languageNames?.length
                      ? blockInfo.astrologer.languageNames.join(", ")
                      : blockInfo.astrologer.languageKnown}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Astrologer information not available</p>
            )}
          </div>

          {/* User Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#FF6B35]" />
              User Information
            </h3>

            {blockInfo.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={avatar(blockInfo.user.profile)}
                    alt={blockInfo.user.name || "User"}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {blockInfo.user.name || "Unknown User"}
                    </h4>
                    {blockInfo.user.gender && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {blockInfo.user.gender}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {blockInfo.user.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      {blockInfo.user.email}
                    </div>
                  )}
                  {blockInfo.user.contactNo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      {blockInfo.user.contactNo}
                    </div>
                  )}
                  {blockInfo.user.birthDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(blockInfo.user.birthDate)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">User information not available</p>
            )}
          </div>
        </div>

        {/* Block Reason */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Block Reason</h3>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {blockInfo.reason}
            </p>
          </div>
        </div>

        {/* Interactions Summary */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total Chats</h3>
                <p className="text-2xl font-bold text-blue-600">{interactions.totalChats}</p>
              </div>
            </div>
            {interactions.recentChats.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Recent chats:</p>
                <div className="space-y-2">
                  {interactions.recentChats.slice(0, 3).map((chat, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-400"
                    >
                      {chat.chatStatus} - {formatDate(chat.created_at)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <PhoneCall className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total Calls</h3>
                <p className="text-2xl font-bold text-green-600">{interactions.totalCalls}</p>
              </div>
            </div>
            {interactions.recentCalls.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Recent calls:</p>
                <div className="space-y-2">
                  {interactions.recentCalls.slice(0, 3).map((call, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-400"
                    >
                      {call.callStatus} - {formatDate(call.created_at)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Review */}
        {userReview && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#FF6B35]" />
              User Review
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= userReview.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                      }`}
                  />
                ))}
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  {userReview.rating} / 5
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {userReview.review}
              </p>
              <p className="text-xs text-gray-500">{formatDate(userReview.created_at)}</p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <Link href="/astro/block-astro">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Blocked Astrologers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}