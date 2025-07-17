import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export default function ProfileDetailsAccordion({ skillDetails, otherDetails, dayAvailability }: { skillDetails: any, otherDetails: any, dayAvailability: any }) {
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setOpenSection(prev => (prev === section ? null : section));
    };

    const Section = ({
        title,
        id,
        data,
    }: {
        title: string;
        id: string;
        data: { label: string; value: string }[];
    }) => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
                className="w-full flex justify-between items-center px-5 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                onClick={() => toggleSection(id)}
            >
                <h3 className="text-lg font-semibold text-teal-600">{title}</h3>
                <ChevronDownIcon
                    className={`w-5 h-5 text-teal-600 transition-transform duration-200 ${openSection === id ? "rotate-180" : ""
                        }`}
                />
            </button>

            <div
                className={`transition-all duration-300 ${openSection === id ? "max-h-screen opacity-100 p-5" : "max-h-0 overflow-hidden opacity-0 p-0"
                    } bg-white dark:bg-gray-900`}
            >
                {openSection === id && (
                    <div className="space-y-3">
                        {data.map((item, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-start bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-md border border-gray-200 dark:border-gray-600"
                            >
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 min-w-[140px]">
                                    {item.label}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white text-right flex-1">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-white dark:bg-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                <Section title="🧠 Skill Details" id="skills" data={skillDetails} />
                <Section title="📋 Other Details" id="others" data={otherDetails} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                <Section title="🧠 Day Availablity" id="availablity" data={dayAvailability} />
            </div>
        </div>
    );
}
