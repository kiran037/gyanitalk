"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast/ToastProvider";
import { Button } from "@/components/adminUI/Button";
import { Input } from "@/components/adminUI/Input";
import { Textarea } from "@/components/adminUI/Textarea";
import { 
  Save, Upload, X, User, Briefcase, GraduationCap, 
  Globe, Share2, Shield, ChevronDown, Check, Plus 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";
import Image from "next/image";

// --- Sub-components for better UI ---

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
  </div>
);

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        checked ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`${
          checked ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
      />
    </button>
  </div>
);

const StyledSelect = ({ label, value, onChange, options, name, required = false, placeholder = "Select..." }: any) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 transition-all focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-900"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  </div>
);

// --- Multi-Select Chip Component (Fixes the UX issue) ---
const MultiSelectChips = ({ label, options, selectedValues, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    if (!selectedValues.includes(value)) {
      onChange([...selectedValues, value]);
    }
    setIsOpen(false);
  };

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter((v: string) => v !== value));
  };

  const availableOptions = options.filter((opt: any) => !selectedValues.includes(opt.value.toString()));

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
      
      <div className="flex flex-wrap gap-2 min-h-[42px] p-2 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900">
        {selectedValues.map((val: string) => {
          const option = options.find((o: any) => o.value.toString() === val);
          return (
            <span key={val} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-medium border border-orange-200 dark:border-orange-800">
              {option?.label || val}
              <button type="button" onClick={() => handleRemove(val)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        
        <div className="relative flex-1 min-w-[120px]">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500 px-2 py-1"
          >
            <Plus className="w-3 h-3" /> Add {label}
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
              {availableOptions.length > 0 ? availableOptions.map((opt: any) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value.toString())}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-700 dark:text-gray-300"
                >
                  {opt.label}
                </button>
              )) : (
                <div className="px-4 py-2 text-sm text-gray-400">No more options</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Form Component ---

interface AstrologerFormProps {
  mode: "create" | "edit";
  initialData?: any;
}

export function AstrologerForm({ mode, initialData }: AstrologerFormProps) {
  const router = useRouter();
  const addToast = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Skills and Languages state
  const [skillsOptions, setSkillsOptions] = useState<any[]>([]);
  const [languagesOptions, setLanguagesOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    contactNo: "",
    gender: "Male",
    birthDate: "",

    // Professional Info
    primarySkill: "",
    allSkill: [] as string[], // Changed to array for better handling
    languageKnown: [] as string[], // Changed to array for better handling
    experienceInYears: "",
    charge: "",
    videoCallRate: "",
    reportRate: "",

    // Profile
    profileImage: "",
    currentCity: "",
    country: "",

    // Background
    highestQualification: "",
    degree: "",
    college: "",
    learnAstrology: "",
    astrologerCategoryId: "",

    // Work Info
    dailyContribution: "",
    minimumEarning: "",
    maximumEarning: "",
    mainSourceOfBusiness: "",
    currentlyworkingfulltimejob: "",
    isWorkingOnAnotherPlatform: false,
    nameofplateform: "",
    monthlyEarning: "",

    // About
    whyOnBoard: "",
    hearAboutAstroguru: "",
    interviewSuitableTime: "",
    goodQuality: "",
    biggestChallenge: "",
    whatwillDo: "",
    loginBio: "",

    // Social Links
    instaProfileLink: "",
    facebookProfileLink: "",
    linkedInProfileLink: "",
    youtubeChannelLink: "",
    websiteProfileLink: "",

    // Additional
    NoofforeignCountriesTravel: "",
    isAnyBodyRefer: false,
    referedPerson: "",

    // Status
    isVerified: false,
    isActive: true,
    chatStatus: "offline",
    callStatus: "offline",
  });

  // Fetch skills and languages on mount
  useEffect(() => {
    fetchOptions();
  }, []);

  // Populate form with initial data
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        ...initialData,
        birthDate: initialData.birthDate ? initialData.birthDate.split("T")[0] : "",
        // Convert CSV strings back to arrays for the UI
        allSkill: initialData.allSkill ? initialData.allSkill.split(",").filter(Boolean) : [],
        languageKnown: initialData.languageKnown ? initialData.languageKnown.split(",").filter(Boolean) : [],
        
        // Ensure numbers are strings for inputs
        experienceInYears: initialData.experienceInYears?.toString() || "",
        charge: initialData.charge?.toString() || "",
        videoCallRate: initialData.videoCallRate?.toString() || "",
        reportRate: initialData.reportRate?.toString() || "",
        dailyContribution: initialData.dailyContribution?.toString() || "",
        minimumEarning: initialData.minimumEarning?.toString() || "",
        maximumEarning: initialData.maximumEarning?.toString() || "",
        NoofforeignCountriesTravel: initialData.NoofforeignCountriesTravel || "",
        
        // Booleans and Selects
        gender: initialData.gender || "Male",
        isVerified: initialData.isVerified || false,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        chatStatus: initialData.chatStatus || "offline",
        callStatus: initialData.callStatus || "offline",
        isWorkingOnAnotherPlatform: initialData.isWorkingOnAnotherPlatform || false,
        isAnyBodyRefer: initialData.isAnyBodyRefer || false,
      });

      if (initialData.profileImage) {
        setImagePreview(avatar(initialData.profileImage));
      }
    }
  }, [mode, initialData]);

  const fetchOptions = async () => {
    try {
      // Simulating fetch or real fetch
      const [skillsRes, languagesRes] = await Promise.all([
        fetch("/api/skills"),
        fetch("/api/languages"),
      ]);

      const [skillsData, languagesData] = await Promise.all([
        skillsRes.json(),
        languagesRes.json(),
      ]);

      if (skillsData.success) {
        setSkillsOptions(skillsData.data.map((s: any) => ({ label: s.name, value: s.id })));
      }
      if (languagesData.success) {
        setLanguagesOptions(languagesData.data.map((l: any) => ({ label: l.languageName, value: l.id })));
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileImagePath = formData.profileImage;

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, "astrologers", mode === "edit" ? formData.profileImage : undefined);
        profileImagePath = uploadResult.path;
      }

      // Prepare payload: Convert arrays back to CSV strings
      const payload = {
        ...formData,
        allSkill: formData.allSkill.join(","),
        languageKnown: formData.languageKnown.join(","),
        profileImage: profileImagePath,
        
        // Number conversions
        experienceInYears: parseInt(formData.experienceInYears) || 0,
        charge: parseInt(formData.charge) || 0,
        videoCallRate: formData.videoCallRate ? parseInt(formData.videoCallRate) : null,
        reportRate: formData.reportRate ? parseInt(formData.reportRate) : null,
        dailyContribution: parseInt(formData.dailyContribution) || 0,
        minimumEarning: parseInt(formData.minimumEarning) || 0,
        maximumEarning: parseInt(formData.maximumEarning) || 0,
        
        createdBy: 1, 
        modifiedBy: 1,
      };

      const url = mode === "create" ? "/api/astrologers" : `/api/astrologers/${initialData.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", `Astrologer ${mode === "create" ? "created" : "updated"} successfully`);
        router.push(mode === "create" ? "/admin/astro" : `/admin/astro/${initialData.id}`);
      } else {
        addToast("error", "Error", data.error || `Failed to ${mode} astrologer`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing astrologer:`, error);
      addToast("error", "Error", `Failed to ${mode} astrologer`);
    } finally {
      setLoading(false);
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto pb-20">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* === SECTION 1: Profile & Basic Info === */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <SectionHeader icon={User} title="Basic Information" />
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image Upload Column */}
              <div className="shrink-0 flex flex-col items-center space-y-4">
                 <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700 bg-gray-100 dark:bg-gray-900 shadow-inner flex items-center justify-center">
                       {imagePreview ? (
                         <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <User className="w-12 h-12 text-gray-300" />
                       )}
                    </div>
                    
                    {/* Overlay Action */}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                       <Upload className="w-6 h-6" />
                       <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setFormData(prev => ({ ...prev, profileImage: "" }));
                        }}
                        className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                 </div>
                 <p className="text-xs text-center text-gray-500 max-w-[150px]">
                    Allowed *.jpeg, *.jpg, *.png max size of 3 MB
                 </p>
              </div>

              {/* Basic Fields Column */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                <Input label="Contact Number" name="contactNo" type="tel" value={formData.contactNo} onChange={handleInputChange} required />
                
                <StyledSelect 
                  label="Gender" 
                  name="gender"
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  required
                  options={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Other", value: "Other" },
                  ]} 
                />
                
                <Input label="Birth Date" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} required />
                <Input label="Current City" name="currentCity" value={formData.currentCity} onChange={handleInputChange} />
                <Input label="Country" name="country" value={formData.country} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* === SECTION 2: Professional Info === */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
           <SectionHeader icon={Briefcase} title="Professional Expertise" />
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Multi Selects */}
              <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                 <MultiSelectChips 
                    label="All Skills"
                    options={skillsOptions}
                    selectedValues={formData.allSkill}
                    onChange={(newVal: string[]) => setFormData(prev => ({ ...prev, allSkill: newVal }))}
                 />
                 <MultiSelectChips 
                    label="Languages Known"
                    options={languagesOptions}
                    selectedValues={formData.languageKnown}
                    onChange={(newVal: string[]) => setFormData(prev => ({ ...prev, languageKnown: newVal }))}
                 />
              </div>

              {/* Primary Skill (Dependent on All Skills) */}
              <StyledSelect 
                  label="Primary Skill" 
                  name="primarySkill"
                  value={formData.primarySkill} 
                  onChange={handleInputChange} 
                  required
                  options={skillsOptions.filter(s => formData.allSkill.includes(s.value.toString()))} 
                  placeholder="Select primary skill from above..."
              />

              <Input label="Experience (Years)" name="experienceInYears" type="number" min="0" value={formData.experienceInYears} onChange={handleInputChange} required />
              
              <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-700 my-2 pt-4">
                 <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Pricing Configuration</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="relative">
                      <Input label="Chat Charge (₹/min)" name="charge" type="number" min="0" value={formData.charge} onChange={handleInputChange} required />
                    </div>
                    <div className="relative">
                      <Input label="Video Call Rate (₹/min)" name="videoCallRate" type="number" min="0" value={formData.videoCallRate} onChange={handleInputChange} />
                    </div>
                    <div className="relative">
                      <Input label="Report Rate (₹)" name="reportRate" type="number" min="0" value={formData.reportRate} onChange={handleInputChange} />
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* === SECTION 3: Education & Background === */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
           <SectionHeader icon={GraduationCap} title="Education & Background" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <Input label="Highest Qualification" name="highestQualification" value={formData.highestQualification} onChange={handleInputChange} required />
             <Input label="Degree / Specialization" name="degree" value={formData.degree} onChange={handleInputChange} />
             <Input label="College / Institute" name="college" value={formData.college} onChange={handleInputChange} className="md:col-span-2" />
             <Input label="Source of Astrology Learning" name="learnAstrology" value={formData.learnAstrology} onChange={handleInputChange} />
             <Input label="Astrologer Category ID" name="astrologerCategoryId" value={formData.astrologerCategoryId} onChange={handleInputChange} required />
           </div>
        </motion.div>

        {/* === SECTION 4: Work & Finances === */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
           <SectionHeader icon={Globe} title="Work & Availability" />
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
             <Input label="Daily Contribution (Hours)" name="dailyContribution" type="number" value={formData.dailyContribution} onChange={handleInputChange} required />
             <Input label="Min Earning Exp. (₹)" name="minimumEarning" type="number" value={formData.minimumEarning} onChange={handleInputChange} required />
             <Input label="Max Earning Exp. (₹)" name="maximumEarning" type="number" value={formData.maximumEarning} onChange={handleInputChange} required />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Main Source of Business" name="mainSourceOfBusiness" value={formData.mainSourceOfBusiness} onChange={handleInputChange} />
              <StyledSelect 
                 label="Working Full-time elsewhere?"
                 name="currentlyworkingfulltimejob"
                 value={formData.currentlyworkingfulltimejob}
                 onChange={handleInputChange}
                 options={[{label: "Yes", value: "Yes"}, {label: "No", value: "No"}]}
              />
              <Input label="Foreign Countries Traveled" name="NoofforeignCountriesTravel" value={formData.NoofforeignCountriesTravel} onChange={handleInputChange} />
           </div>

           {/* Toggle for other platform */}
           <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30">
              <Toggle 
                 label="Are you currently working on another astrology platform?"
                 checked={formData.isWorkingOnAnotherPlatform}
                 onChange={(checked) => setFormData(prev => ({ ...prev, isWorkingOnAnotherPlatform: checked }))}
              />
              
              <AnimatePresence>
                {formData.isWorkingOnAnotherPlatform && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                      <Input label="Platform Name" name="nameofplateform" value={formData.nameofplateform} onChange={handleInputChange} />
                      <Input label="Monthly Earning there" name="monthlyEarning" value={formData.monthlyEarning} onChange={handleInputChange} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </motion.div>

        {/* === SECTION 5: Onboarding Questions === */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
           <SectionHeader icon={Shield} title="Interview & Bio" />
           <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                 <Textarea label="Why do you want to join us?" name="whyOnBoard" value={formData.whyOnBoard} onChange={handleInputChange} rows={3} required />
                 <Textarea label="What are your goals here?" name="whatwillDo" value={formData.whatwillDo} onChange={handleInputChange} rows={3} required />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                 <Textarea label="Your Best Qualities" name="goodQuality" value={formData.goodQuality} onChange={handleInputChange} rows={2} />
                 <Textarea label="Biggest Challenge Faced" name="biggestChallenge" value={formData.biggestChallenge} onChange={handleInputChange} rows={2} />
              </div>
              <Textarea label="Login Bio (Visible to customers)" name="loginBio" value={formData.loginBio} onChange={handleInputChange} rows={3} />
              
              <div className="grid md:grid-cols-2 gap-5">
                <Textarea label="How did you hear about us?" name="hearAboutAstroguru" value={formData.hearAboutAstroguru} onChange={handleInputChange} rows={2} />
                <Input label="Preferred Interview Time" name="interviewSuitableTime" value={formData.interviewSuitableTime} onChange={handleInputChange} />
              </div>
           </div>
        </motion.div>

        {/* === SECTION 6: Social & Status === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <SectionHeader icon={Share2} title="Social Media" />
              <div className="space-y-4">
                 <Input label="Instagram" name="instaProfileLink" placeholder="https://instagram.com/..." value={formData.instaProfileLink} onChange={handleInputChange} />
                 <Input label="Facebook" name="facebookProfileLink" placeholder="https://facebook.com/..." value={formData.facebookProfileLink} onChange={handleInputChange} />
                 <Input label="LinkedIn" name="linkedInProfileLink" placeholder="https://linkedin.com/in/..." value={formData.linkedInProfileLink} onChange={handleInputChange} />
                 <Input label="YouTube" name="youtubeChannelLink" placeholder="https://youtube.com/..." value={formData.youtubeChannelLink} onChange={handleInputChange} />
                 <Input label="Website" name="websiteProfileLink" placeholder="https://..." value={formData.websiteProfileLink} onChange={handleInputChange} />
              </div>
           </motion.div>

           {/* Status Settings (Only Edit Mode) */}
           {mode === "edit" && (
             <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <SectionHeader icon={Check} title="Account Status" />
                <div className="space-y-4">
                   <Toggle label="Is Verified Astrologer?" checked={formData.isVerified} onChange={(c) => setFormData(prev => ({...prev, isVerified: c}))} />
                   <Toggle label="Is Account Active?" checked={formData.isActive} onChange={(c) => setFormData(prev => ({...prev, isActive: c}))} />
                   
                   <div className="grid grid-cols-2 gap-4 mt-4">
                      <StyledSelect 
                        label="Chat Status" 
                        name="chatStatus"
                        value={formData.chatStatus} 
                        onChange={handleInputChange} 
                        options={[{label: "Online", value: "online"}, {label: "Offline", value: "offline"}, {label: "Busy", value: "busy"}]}
                      />
                      <StyledSelect 
                        label="Call Status" 
                        name="callStatus"
                        value={formData.callStatus} 
                        onChange={handleInputChange} 
                        options={[{label: "Online", value: "online"}, {label: "Offline", value: "offline"}, {label: "Busy", value: "busy"}]}
                      />
                   </div>
                </div>
             </motion.div>
           )}
        </div>

      </motion.div>

      {/* === Sticky Footer Actions === */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-4 md:pl-72">
        <div className="max-w-5xl mx-auto flex items-center justify-end gap-4">
           <Button
             type="button"
             variant="outline"
             onClick={() => router.back()}
             disabled={loading}
             className="px-6"
           >
             Cancel
           </Button>
           <Button
             type="submit"
             variant="primary"
             icon={<Save className="h-4 w-4" />}
             loading={loading}
             className="px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0 shadow-lg shadow-orange-500/20"
           >
             {mode === "create" ? "Create Profile" : "Save Changes"}
           </Button>
        </div>
      </div>
    </form>
  );
}