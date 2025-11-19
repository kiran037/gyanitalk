"use client";

import LandingWrapper from "@/components/landing/LandingWrapper";
import { FileText, Shield, Smartphone, Wifi, AlertCircle, RefreshCw, Mail, CheckCircle } from "lucide-react";

export default function TermsOfServicePage() {
    return (
        <LandingWrapper>
            {/* Hero Section */}
            <section className="pt-32 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-20 -right-20 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>

                <div className="w-full px-10 mx-auto relative z-10">
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-sm font-semibold mb-6 shadow-lg">
                            <FileText className="w-4 h-4" />
                            LEGAL
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Terms & Conditions</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Please read these terms carefully before using the Gyanitalk app
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                            Effective as of November 4, 2020
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="w-full px-10 mx-auto">
                    {/* Introduction */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Introduction</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    By downloading or using the app, these terms will automatically apply to you – you should make sure therefore that you read them carefully before using the app. You're not allowed to copy, or modify the app, any part of the app, or our trademarks in any way. You're not allowed to attempt to extract the source code of the app, and you also shouldn't try to translate the app into other languages, or make derivative versions. The app itself, and all the trade marks, copyright, database rights and other intellectual property rights related to it, still belong to Gyanitalk.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-[#FF6B35]/10 dark:bg-[#FF6B35]/20 border border-[#FF6B35]/30 rounded-xl">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Important:</strong> By agreeing to these terms, you are also accepting the Privacy Policy of this app.
                            </p>
                        </div>
                    </div>

                    {/* App Usage & Services */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FFCC80] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Smartphone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">App Usage & Services</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <p>
                                        Gyanitalk is committed to ensuring that the app is as useful and efficient as possible. For that reason, we reserve the right to make changes to the app or to charge for its services, at any time and for any reason. We will never charge you for the app or its services without making it very clear to you exactly what you're paying for.
                                    </p>
                                    <p>
                                        The Gyanitalk app stores and processes personal data that you have provided to us, in order to provide our Service. It's your responsibility to keep your phone and access to the app secure. We therefore recommend that you do not jailbreak or root your phone, which is the process of removing software restrictions and limitations imposed by the official operating system of your device. It could make your phone vulnerable to malware/viruses/malicious programs, compromise your phone's security features and it could mean that the Gyanitalk app won't work properly or at all.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Third Party Services */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Third Party Services</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                    The app does use third party services that declare their own Terms and Conditions.
                                </p>
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Third party service providers used by the app:
                                    </p>
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

                    {/* Internet Connection & Connectivity */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF8C61] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Wifi className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Internet Connection & Connectivity</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <p>
                                        You should be aware that there are certain things that Gyanitalk will not take responsibility for. Certain functions of the app will require the app to have an active internet connection. The connection can be Wi-Fi, or provided by your mobile network provider, but Gyanitalk cannot take responsibility for the app not working at full functionality if you don't have access to Wi-Fi, and you don't have any of your data allowance left.
                                    </p>
                                    <p>
                                        If you're using the app outside of an area with Wi-Fi, you should remember that your terms of the agreement with your mobile network provider will still apply. As a result, you may be charged by your mobile provider for the cost of data for the duration of the connection while accessing the app, or other third party charges. In using the app, you're accepting responsibility for any such charges, including roaming data charges if you use the app outside of your home territory (i.e. region or country) without turning off data roaming. If you are not the bill payer for the device on which you're using the app, please be aware that we assume that you have received permission from the bill payer for using the app.
                                    </p>
                                    <p>
                                        Along the same lines, Gyanitalk cannot always take responsibility for the way you use the app i.e. You need to make sure that your device stays charged – if it runs out of battery and you can't turn it on to avail the Service, Gyanitalk cannot accept responsibility.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App Reliability */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FFCC80] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">App Reliability & Liability</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    With respect to Gyanitalk's responsibility for your use of the app, when you're using the app, it's important to bear in mind that although we endeavour to ensure that it is updated and correct at all times, we do rely on third parties to provide information to us so that we can make it available to you. Gyanitalk accepts no liability for any loss, direct or indirect, you experience as a result of relying wholly on this functionality of the app.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Updates & Termination */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FF6B35] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <RefreshCw className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Updates & Termination</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <p>
                                        At some point, we may wish to update the app. The app is currently available on Android & iOS – the requirements for both systems (and for any additional systems we decide to extend the availability of the app to) may change, and you'll need to download the updates if you want to keep using the app. Gyanitalk does not promise that it will always update the app so that it is relevant to you and/or works with the Android & iOS version that you have installed on your device. However, you promise to always accept updates to the application when offered to you.
                                    </p>
                                    <p>
                                        We may also wish to stop providing the app, and may terminate use of it at any time without giving notice of termination to you. Unless we tell you otherwise, upon any termination, (a) the rights and licenses granted to you in these terms will end; (b) you must stop using the app, and (if needed) delete it from your device.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Changes to Terms */}
                    <div className="bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 dark:from-[#FF6B35]/20 dark:to-[#FFB347]/20 border border-[#FF6B35]/30 dark:border-[#FF6B35]/30 rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Changes to Terms and Conditions</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            We may update our Terms and Conditions from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Terms and Conditions on this page.
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
                                    If you have any questions or suggestions about our Terms and Conditions, do not hesitate to contact us:
                                </p>
                                <a 
                                    href="mailto:gyanitalksapp@gmail.com"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF5722] hover:to-[#FF6B35] text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-[#FF6B35]/50 hover:scale-105 transition-all duration-300"
                                >
                                    <Mail className="w-4 h-4" />
                                    gyanitalksapp@gmail.com
                                </a>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                                    This Terms and Conditions page was generated by App Privacy Policy Generator
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LandingWrapper>
    );
}