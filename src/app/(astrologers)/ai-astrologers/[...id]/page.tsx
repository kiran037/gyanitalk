"use client"
import Image from "next/image"
import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import AstroDetailsSkeleton from "@/components/(astros)/astrologers/astrologer-details-skeleton"
import { getAiProfileDetails, updateAiProfile } from "@/components/(astros)/ai-astrologer/fetch"
import { X, ChevronDown } from "lucide-react"
import { uploadImage } from "@/upload"

export default function Page() {
    const params = useParams()
    const id = params?.id

    const [data, setData] = useState<any>(null)
    const [formData, setFormData] = useState<any>({
        name: "",
        about: "",
        astrologerCategoryId: [] as number[],
        primary_skill: [] as number[],
        all_skills: [] as number[],
        aiType: "gemini",          // new
        featured: 0,               // new, 0 or 1
        chat_charge: 0,             // new
        experience: 0,             // new
        imageFile: null,           // new, for upload
    })


    const [dropdownOpen, setDropdownOpen] = useState({
        categories: false,
        primarySkills: false,
        allSkills: false,
    })

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const result = await getAiProfileDetails({ id })
                    setData(result)

                    // Convert comma-separated strings into arrays of numbers
                    setFormData({
                        ...result.astroDetail,
                        astrologerCategoryId: result.astroDetail?.astrologerCategoryId
                            ? result.astroDetail.astrologerCategoryId.split(",").map((x: string) => Number(x))
                            : [],
                        primary_skill: result.astroDetail?.primary_skill
                            ? result.astroDetail.primary_skill.split(",").map((x: string) => Number(x))
                            : [],
                        all_skills: result.astroDetail?.all_skills
                            ? result.astroDetail.all_skills.split(",").map((x: string) => Number(x))
                            : [],
                    })
                } catch (error) {
                    console.error("Failed to fetch profile:", error)
                }
            }
            fetchData()
        }
    }, [id])

    const handleItemToggle = (name: "astrologerCategoryId" | "primary_skill" | "all_skills", itemId: number) => {
        const currentItems = formData[name]
        const isSelected = currentItems.includes(itemId)

        setFormData({
            ...formData,
            [name]: isSelected ? currentItems.filter((id: number) => id !== itemId) : [...currentItems, itemId],
        })
    }

    const handleRemoveChip = (name: "astrologerCategoryId" | "primary_skill" | "all_skills", id: number) => {
        setFormData({
            ...formData,
            [name]: formData[name].filter((x: number) => x !== id),
        })
    }

    const getItemName = (items: any[], id: number) => {

        const item = items?.find((item: any) => Number(item.id) === Number(id))
        return item?.name || ""
    }

    const toggleDropdown = (dropdown: keyof typeof dropdownOpen) => {
        setDropdownOpen((prev) => ({
            ...prev,
            [dropdown]: !prev[dropdown],
        }))
    }

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault()
    //     const payload = {
    //         ...formData,
    //         astrologerCategoryId: formData.astrologerCategoryId.join(","),
    //         primary_skill: formData.primary_skill.join(","),
    //         all_skills: formData.all_skills.join(","),
    //     }
    //     console.log("Payload to submit 👉", payload)
    //     await updateAiProfile(id, payload)
    // }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let imagePath = null;

        if (formData.imageFile) {
            // Upload the image first
            const result = await uploadImage(formData.imageFile, "images/aiastrologer-profile", 'public/assets');
            if (result.success) {
                imagePath = result.path;
            }
        }



        console.log(`profile path ${imagePath}`);


        // Prepare payload
        const payload = {
            ...formData,
            astrologerCategoryId: formData.astrologerCategoryId.join(","),
            primary_skill: formData.primary_skill.join(","),
            all_skills: formData.all_skills.join(","),
            ...(imagePath ? { image: imagePath } : {}),
        };

        // Call your API or server action
        // const res = await fetch(`/api/ai-astrologer/${id}`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(payload),
        // });

        // const data = await res.json();
        console.log("Updated profile: payload", payload);
    };





    if (!data) return <AstroDetailsSkeleton />

    return (
        <div className="mx-auto w-full max-w-4xl p-6">
            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex items-center gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <div className="relative w-32 h-32">
                        {/* Profile Image */}
                        <Image
                            src={
                                formData.imageFile
                                    ? URL.createObjectURL(formData.imageFile) // preview if selected
                                    : data.astroDetail?.image
                                        ? `${process.env.NEXT_PUBLIC_BASEURL}${data.astroDetail.image}`
                                        : "https://gyanitalk.com/build/assets/images/person.png"
                            }
                            fill
                            className="rounded-full border-4 border-white shadow-lg object-cover"
                            alt="profile"
                        />

                        {/* Status Dot */}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>

                        {/* File Input Overlay */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setFormData({ ...formData, imageFile: e.target.files[0] });
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                            title="Click to change image"
                        />
                    </div>

                    <div className="flex-1">
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Astrologer Name"
                            className="text-3xl font-bold w-full bg-transparent border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 outline-none pb-2 transition-colors"
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                AI Astrologer
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8 space-y-8">
                    {/* About */}
                    <section>
                        <label className="block mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">About</label>
                        <textarea
                            name="about"
                            value={formData.about || ""}
                            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                            placeholder="Write a compelling bio that showcases your expertise and approach..."
                            className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-50 dark:bg-gray-800 dark:text-white resize-none"
                            rows={4}
                        />
                    </section>

                    {/* Categories Multi-select */}
                    <section>
                        <label className="block mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Categories</label>

                        {/* Selected Categories as Badges */}
                        <div className="mb-4">
                            {formData.astrologerCategoryId.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.astrologerCategoryId.map((catId: number) => (
                                        <span
                                            key={catId}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium"
                                        >
                                            {getItemName(data.categories, catId)}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveChip("astrologerCategoryId", catId)}
                                                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No categories selected</p>
                            )}
                        </div>

                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => toggleDropdown("categories")}
                                className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            >
                                <span className="text-gray-700 dark:text-gray-300">Add categories...</span>
                                <ChevronDown
                                    className={`transition-transform ${dropdownOpen.categories ? "rotate-180" : ""}`}
                                    size={20}
                                />
                            </button>

                            {dropdownOpen.categories && (
                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {data.categories
                                        .filter((cat: any) => !formData.astrologerCategoryId.includes(Number(cat.id))) // filter selected
                                        .map((cat: any) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => handleItemToggle("astrologerCategoryId", cat.id)}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${formData.astrologerCategoryId.includes(cat.id)
                                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                                    : "text-gray-700 dark:text-gray-300"
                                                    }`}
                                            >
                                                {cat.name}
                                                {formData.astrologerCategoryId.includes(cat.id) && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Primary Skills */}
                    <section>
                        <label className="block mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Primary Skills</label>

                        {/* Selected Primary Skills as Badges */}
                        <div className="mb-4">
                            {formData.primary_skill.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.primary_skill.map((skillId: number) => (
                                        <span
                                            key={skillId}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium"
                                        >
                                            {getItemName(data.skills, skillId)}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveChip("primary_skill", skillId)}
                                                className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-1 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No primary skills selected</p>
                            )}
                        </div>

                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => toggleDropdown("primarySkills")}
                                className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition-colors"
                            >
                                <span className="text-gray-700 dark:text-gray-300">Add primary skills...</span>
                                <ChevronDown
                                    className={`transition-transform ${dropdownOpen.primarySkills ? "rotate-180" : ""}`}
                                    size={20}
                                />
                            </button>

                            {dropdownOpen.primarySkills && (
                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {data.skills
                                        .filter((skill: any) => !formData.primary_skill.includes(Number(skill.id)))
                                        .map((skill: any) => (
                                            <button
                                                key={skill.id}
                                                type="button"
                                                onClick={() => handleItemToggle("primary_skill", skill.id)}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${formData.primary_skill.includes(skill.id)
                                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                    : "text-gray-700 dark:text-gray-300"
                                                    }`}
                                            >
                                                {skill.name}
                                                {formData.primary_skill.includes(skill.id) && (
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                )}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* All Skills */}
                    <section>
                        <label className="block mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">All Skills</label>

                        {/* Selected All Skills as Badges */}
                        <div className="mb-4">
                            {formData.all_skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.all_skills.map((skillId: number) => (
                                        <span
                                            key={skillId}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium"
                                        >
                                            {getItemName(data.skills, skillId)}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveChip("all_skills", skillId)}
                                                className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-1 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No additional skills selected</p>
                            )}
                        </div>

                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => toggleDropdown("allSkills")}
                                className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
                            >
                                <span className="text-gray-700 dark:text-gray-300">Add additional skills...</span>
                                <ChevronDown
                                    className={`transition-transform ${dropdownOpen.allSkills ? "rotate-180" : ""}`}
                                    size={20}
                                />
                            </button>

                            {dropdownOpen.allSkills && (
                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {data.skills
                                        .filter((skill: any) => !formData.all_skills.includes(Number(skill.id)))
                                        .map((skill: any) => (
                                            <button
                                                key={skill.id}
                                                type="button"
                                                onClick={() => handleItemToggle("all_skills", skill.id)}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${formData.all_skills.includes(skill.id)
                                                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                                    : "text-gray-700 dark:text-gray-300"
                                                    }`}
                                            >
                                                {skill.name}
                                                {formData.all_skills.includes(skill.id) && (
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                )}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* AI Type */}
                    <section>
                        <label className="block mb-2 font-medium">AI Type</label>
                        <select
                            value={formData.aiType}
                            onChange={(e) => setFormData({ ...formData, aiType: e.target.value })}
                            className="w-full border rounded-lg p-3"
                        >
                            <option value="gemini">Gemini</option>
                            <option value="openai">OpenAI</option>
                        </select>
                    </section>

                    {/* Featured */}
                    <section>
                        <label className="block mb-2 font-medium">Featured</label>
                        <select
                            value={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: Number(e.target.value) })}
                            className="w-full border rounded-lg p-3"
                        >
                            <option value={0}>No</option>
                            <option value={1}>Yes</option>
                        </select>
                    </section>

                    {/* Edit Charge */}
                    <section>
                        <label className="block mb-2 font-medium">Edit Charge</label>
                        <input
                            type="number"
                            value={formData.chat_charge}
                            onChange={(e) => setFormData({ ...formData, chat_charge: Number(e.target.value) })}
                            className="w-full border rounded-lg p-3"
                        />
                    </section>

                    {/* Experience */}
                    <section>
                        <label className="block mb-2 font-medium">Experience (years)</label>
                        <input
                            type="number"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                            className="w-full border rounded-lg p-3"
                        />
                    </section>

                    {/* <section>
                        <label className="block mb-2 font-medium">Profile Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] })}
                            className="w-full"
                        />
                    </section> */}

                </div>

                {/* Submit */}
                <div className="p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    )
}
