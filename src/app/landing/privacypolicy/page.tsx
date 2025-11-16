"use client";

import LandingWrapper from "@/components/landing/LandingWrapper";
import { Shield, Lock, Users, Camera, MapPin, Smartphone, Database, Cookie, CreditCard, AlertTriangle, FileText, MessageSquare, Mail, CheckCircle, XCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <LandingWrapper>
            {/* Hero Section */}
            <section className="pt-32 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-20 -right-20 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-sm font-semibold mb-6 shadow-lg">
                            <Shield className="w-4 h-4" />
                            YOUR PRIVACY MATTERS
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Privacy Policy</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Understanding what data we collect, why we collect it, and what we do with it
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                            Effective as of November 4, 2020
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Important Notice */}
                    <div className="bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 dark:from-[#FF6B35]/20 dark:to-[#FFB347]/20 border border-[#FF6B35]/30 dark:border-[#FF6B35]/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-[#FF6B35] dark:text-[#FF8C61] flex-shrink-0 mt-1" />
                            <div className="space-y-2">
                                <p className="text-gray-700 dark:text-gray-300 font-semibold">
                                    Important Information:
                                </p>
                                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    <li>• User can only access app after login</li>
                                    <li>• Gyanitalk app is a subscription-based app</li>
                                    <li>• You always need an active subscription to use this app</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Introduction */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Introduction</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                    This page is used to inform visitors regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    If you choose to use our Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Information Collection */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FFCC80] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Information Collection and Use</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                    For a better experience, while using our Service, we may require you to provide us with certain personally identifiable information. The information that we request will be retained by us and used as described in this privacy policy.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                                    {[
                                        "Name",
                                        "Email",
                                        "Phone",
                                        "Addresses",
                                        "Gender",
                                        "Birthdate",
                                        "Anniversary Date",
                                        "Location",
                                        "Profile Picture"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 bg-white/40 dark:bg-gray-700/40 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-[#FF6B35] dark:text-[#FF8C61] flex-shrink-0" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                    The app uses API to communicate with the server/data.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Permissions Needed</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                    Gyanitalk needs the following permissions to run:
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { icon: Camera, title: "CAMERA", desc: "For video Meet" },
                                        { icon: Camera, title: "Device Audio", desc: "For video Meet" },
                                        { icon: Users, title: "Contacts", desc: "READ_CONTACTS, WRITE_CONTACTS" },
                                        { icon: MapPin, title: "Location", desc: "ACCESS_COARSE_LOCATION" },
                                        { icon: Smartphone, title: "Device Permissions", desc: "INTERNET, ACCESS_NETWORK_STATE, RECEIVE_BOOT_COMPLETED, VIBRATE" }
                                    ].map((perm, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB347]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <perm.icon className="w-5 h-5 text-[#FF6B35] dark:text-[#FF8C61]" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{perm.title}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{perm.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Third Party Services */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF8C61] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Third Party Services</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                    The app uses third party services that may collect information used to identify you.
                                </p>
                                <div className="space-y-2">
                                    {[
                                        "Google Play Services",
                                        "Google Analytics for Firebase",
                                        "Facebook"
                                    ].map((service, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 bg-white/40 dark:bg-gray-700/40 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-[#FF6B35] dark:text-[#FF8C61] flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">{service}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Log Data */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FFCC80] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Log Data</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    We want to inform you that whenever you use our Service, in a case of an error in the app we collect data and information (through third party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol ("IP") address, device name, operating system version, the configuration of the app when utilizing our Service, the time and date of your use of the Service, and other statistics.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cookies */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FF6B35] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Cookie className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Cookies</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                    Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory.
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    This Service does not use these "cookies" explicitly. However, the app may use third party code and libraries that use "cookies" to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Service Providers */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Service Providers</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                    We may employ third-party companies and individuals due to the following reasons:
                                </p>
                                <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                                    <li>• To facilitate our Service</li>
                                    <li>• To provide the Service on our behalf</li>
                                    <li>• To perform Service-related services</li>
                                    <li>• To assist us in analyzing how our Service is used</li>
                                </ul>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
                                    We want to inform users of this Service that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF8C61] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Security</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FFCC80] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Payments</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                    We may provide paid products and/or services within the Service. In that case, we use third-party services for payment processing (e.g. payment processors).
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    We will not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Children's Privacy */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FF6B35] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Children's Privacy</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    These Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Code of Conduct */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Code of Conduct & Legal Action Policy</h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                    All users and astrologers on Gyanitalk must maintain a respectful, polite, and professional tone during any interaction on the platform.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* User Misconduct */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl p-5">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    User Misconduct - Zero Tolerance
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                                    <li>• Use of abusive, vulgar, or obscene language</li>
                                    <li>• Threats, intimidation, or mental harassment</li>
                                    <li>• Personal attacks or character defamation</li>
                                    <li>• Disrespectful or communal remarks</li>
                                </ul>
                                <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                                    <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">Legal Action May Be Initiated Under:</p>
                                    <p className="text-xs text-red-700 dark:text-red-400">IPC Sections: 294, 504, 506, 509 | IT Act 2000: Section 67</p>
                                </div>
                                <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    <p className="font-semibold">Consequences:</p>
                                    <ul className="ml-4 space-y-1 text-xs">
                                        <li>• Temporary or permanent account suspension</li>
                                        <li>• Forfeiture of wallet or promotional balances</li>
                                        <li>• Legal complaint (FIR) if necessary</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Astrologer Misconduct */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl p-5">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    Astrologer Misconduct
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    Any astrologer found engaging in:
                                </p>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                                    <li>• Abusive or disrespectful behavior</li>
                                    <li>• Misleading or threatening language</li>
                                    <li>• Discrimination or inappropriate conduct</li>
                                </ul>
                                <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    <p className="font-semibold">Will Face:</p>
                                    <ul className="ml-4 space-y-1 text-xs">
                                        <li>• Immediate suspension or permanent delisting</li>
                                        <li>• Legal action as per IPC and IT Act</li>
                                        <li>• Reporting to relevant authorities if needed</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Reporting */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl p-5">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Reporting & Complaint Mechanism</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    If you experience or witness any misconduct, please report it immediately using the in-app "Report" feature or email us at:
                                </p>
                                <a 
                                    href="mailto:hr@gyanitalk.com"
                                    className="inline-flex items-center gap-2 text-sm text-[#FF6B35] dark:text-[#FF8C61] font-semibold hover:underline"
                                >
                                    <Mail className="w-4 h-4" />
                                    hr@gyanitalk.com
                                </a>
                            </div>

                            {/* Evidence & Monitoring */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl p-5">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Evidence & Monitoring</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    For quality assurance and legal purposes, Gyanitalk securely logs chat, audio, and video interactions. These may be used as evidence in case of dispute or abuse.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Changes to Policy */}
                    <div className="bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 dark:from-[#FF6B35]/20 dark:to-[#FFB347]/20 border border-[#FF6B35]/30 dark:border-[#FF6B35]/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Changes to This Privacy Policy</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Contact Us</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                    If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us:
                                </p>
                                <a 
                                    href="mailto:gyanitalksapp@gmail.com"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF5722] hover:to-[#FF6B35] text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-[#FF6B35]/50 hover:scale-105 transition-all duration-300"
                                >
                                    <Mail className="w-4 h-4" />
                                    gyanitalksapp@gmail.com
                                </a>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                                    This privacy policy page was created at privacypolicytemplate.net and modified/generated by App Privacy Policy Generator
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LandingWrapper>
    );
}