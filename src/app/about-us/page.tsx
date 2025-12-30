// app/landing/about-us/page.tsx
import { Metadata } from "next";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  Target,
  Users,
  Shield,
  Zap,
  Award,
  Heart,
  Globe,
  TrendingUp,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@prisma/client";
import { cache } from "react";

interface PageData {
  page: {
    id: number;
    title: string;
    description: string;
    slug: string;
  };
  seo: {
    title: string;
    metaDescription: string;
    metaKeywords: string[];
    canonicalUrl: string;
    openGraph: {
      title: string;
      description: string;
      image: string;
      url: string;
    };
    twitter: {
      title: string;
      description: string;
      image: string;
    };
    schema: any;
  };
  computed: {
    readTime: string;
    wordCount: number;
    lastModified: string;
  };
}

const getPageData = cache(async (): Promise<PageData | null> => {
  try {
    const page = await prisma.pages.findFirst({
      where: {
        type: "aboutus" as pages_type,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterImage: true,
        schemaJson: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!page) return null;

    const stripHtml = (html?: string | null) =>
      html ? html.replace(/<[^>]+>/g, "") : "";

    const seo = {
      title: page.metaTitle || page.title || "About Us | Gyanitalk",
      metaDescription:
        page.metaDescription || stripHtml(page.description).slice(0, 160),
      metaKeywords: page.metaKeywords
        ? page.metaKeywords.split(",").map((s) => s.trim())
        : [],
      canonicalUrl: page.canonicalUrl || `/about-us`,
      openGraph: {
        title: page.ogTitle || page.metaTitle || page.title,
        description:
          page.ogDescription ||
          page.metaDescription ||
          stripHtml(page.description).slice(0, 200),
        image: page.ogImage || null,
        url:
          (process.env.NEXT_PUBLIC_BASEURL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            "") +
          (page.slug ? `/${page.slug}` : `/about-us`),
      },
      twitter: {
        title: page.twitterTitle || page.ogTitle || page.metaTitle || page.title,
        description:
          page.twitterDescription ||
          page.ogDescription ||
          page.metaDescription ||
          "",
        image: page.twitterImage || page.ogImage || null,
      },
      schema: page.schemaJson
        ? typeof page.schemaJson === "string"
          ? JSON.parse(page.schemaJson)
          : page.schemaJson
        : null,
    };

    const computed = {
      readTime: "—",
      wordCount: stripHtml(page.description).split(/\s+/).filter(Boolean).length,
      lastModified:
        (page.updated_at || page.created_at)?.toISOString() ||
        new Date().toISOString(),
    };

    return {
      page: {
        id: Number(page.id),
        title: page.title || "About Us",
        description: page.description || "",
        slug: page.slug || "about-us",
      },
      seo,
      computed,
    } as PageData;
  } catch (err) {
    console.error("getPageData error (prisma):", err);
    return null;
  }
});

// Server-side metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageData();

  if (!pageData) {
    return {
      title: "About Us | Gyanitalk",
      description:
        "Learn about Gyanitalk - bridging ancient wisdom with modern technology.",
    };
  }

  return {
    title: pageData.seo.title,
    description: pageData.seo.metaDescription,
    keywords: pageData.seo.metaKeywords,
    alternates: { canonical: pageData.seo.canonicalUrl },
    openGraph: {
      title: pageData.seo.openGraph.title,
      description: pageData.seo.openGraph.description,
      images: pageData.seo.openGraph.image
        ? [pageData.seo.openGraph.image]
        : undefined,
      url: pageData.seo.openGraph.url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageData.seo.twitter.title,
      description: pageData.seo.twitter.description,
      images: pageData.seo.twitter.image
        ? [pageData.seo.twitter.image]
        : undefined,
    },
    ...(pageData.seo.schema && {
      other: {
        "application/ld+json": JSON.stringify(pageData.seo.schema),
      },
    }),
  };
}

export default async function AboutPage() {
  const pageData = await getPageData();

  return (
    <LandingWrapper>
      <main id="main-content">
        {/* Structured Data Schema */}
        {pageData?.seo.schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.seo.schema) }}
          />
        )}
        <section className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20 sm:pt-24 pb-10 sm:pb-14">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Floating Particles – only on >= sm for perf */}
          <div className="hidden sm:block">
            {Array.from({ length: 15 }).map((_, i) => (
              <AnimatedSection
                key={i}
                type="particle"
                delay={i * 0.4}
                style={{
                  position: "absolute",
                  left: `${5 + ((i % 5) * 18)}%`,
                  top: `${5 + Math.floor(i / 5) * 25}%`,
                  pointerEvents: "none",
                }}
              >
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-[2px] opacity-60" />
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full animate-ping opacity-30" />
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Gradient Orbs – only on md+ for performance */}
          <div className="hidden md:block">
            <AnimatedSection type="orb1">
              <div className="absolute top-1/4 -left-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10" />
            </AnimatedSection>
            <AnimatedSection type="orb2">
              <div className="absolute top-1/3 -right-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10" />
            </AnimatedSection>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <AnimatedSection type="fadeInUp">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
                  <Sparkles aria-hidden="true" className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    OUR STORY
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                  <span className="text-gray-900 dark:text-white">About </span>
                  <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                    Gyani Talk
                  </span>
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                  Bridging ancient wisdom with modern technology.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Dynamic Content from Database */}
        {pageData && pageData.page.description && (
          <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <AnimatedSection type="fadeInUp">
                <article className="prose prose-base sm:prose-lg dark:prose-invert max-w-none">
                  <div
                    className="about-content bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-7 shadow-md [&_p]:mb-4 [&_p]:text-[0.95rem] sm:[&_p]:text-[1.05rem] [&_p]:leading-[1.8] [&_p]:text-gray-700 dark:[&_p]:text-gray-300 [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_strong]:text-[#FF6B35] dark:[&_strong]:text-[#FF8C61] [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: pageData.page.description }}
                  />
                </article>
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Mission & Vision */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {[
                {
                  icon: Target,
                  title: "Our Mission",
                  desc: "To democratize access to authentic astrological guidance by connecting seekers with verified experts through an intuitive, secure, technology-driven platform.",
                  gradient: "from-[#FF6B35] to-[#FF8C61]",
                },
                {
                  icon: Globe,
                  title: "Our Vision",
                  desc: "To become the world's most trusted astrology platform, empowering millions to make informed life decisions through personalized cosmic insights.",
                  gradient: "from-[#FFB347] to-[#FFCC80]",
                },
              ].map((item, i) => (
                <AnimatedSection key={item.title} type="fadeInUp" delay={i * 0.1}>
                  <div className="group p-6 sm:p-7 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 rounded-2xl hover:shadow-lg hover:-translate-y-1 hover:border-[#FF6B35]/50 transition-all duration-300 cursor-pointer h-full">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection type="fadeInUp">
              <div className="text-center mb-8 sm:mb-12">
                <div className="inline-block mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#FF6B35]">
                    CORE VALUES
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
                  <span className="text-gray-900 dark:text-white">
                    The Principles That{" "}
                  </span>
                  <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                    Guide Us
                  </span>
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Everything we do is driven by these fundamental values.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[
                {
                  icon: Shield,
                  title: "Trust & Security",
                  desc: "Your privacy and data security are our top priorities.",
                },
                {
                  icon: Award,
                  title: "Excellence",
                  desc: "Only verified expert astrologers on our platform.",
                },
                {
                  icon: Heart,
                  title: "Empathy",
                  desc: "Understanding and addressing your spiritual needs.",
                },
                {
                  icon: Zap,
                  title: "Innovation",
                  desc: "Continuously improving with cutting-edge technology.",
                },
              ].map((value, i) => (
                <AnimatedSection key={value.title} type="fadeInUp" delay={i * 0.1}>
                  <div className="group p-5 sm:p-6 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 rounded-2xl hover:-translate-y-1 hover:shadow-lg hover:border-[#FF6B35]/50 transition-all duration-300 cursor-pointer h-full">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:rotate-6 transition-transform duration-300">
                      <value.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1.5">
                      {value.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {value.desc}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <AnimatedSection type="fadeInLeft">
                <div className="relative h-[260px] sm:h-[320px] lg:h-[380px] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop"
                    alt="Expert Consultation"
                    width="800"
                    height="600"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB347]/20" />
                </div>
              </AnimatedSection>

              <AnimatedSection type="fadeInRight">
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#FF6B35]">
                      WHY CHOOSE US
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-3 sm:mt-4">
                      What Makes Us Different
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {[
                      "100+ verified expert astrologers available 24/7.",
                      "Secure payment gateway with multiple options.",
                      "Personalized horoscope readings and predictions.",
                      "Free initial consultation for new users.",
                      "Multi-language support for global accessibility.",
                      "Advanced technology for a seamless experience.",
                    ].map((feature, i) => (
                      <AnimatedSection
                        key={feature}
                        type="fadeInUp"
                        delay={i * 0.08}
                      >
                        <div className="flex gap-3 items-start p-3.5 sm:p-4 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 rounded-xl hover:translate-x-1 hover:border-[#FF6B35]/30 transition-all duration-200">
                          <CheckCircle aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </p>
                        </div>
                      </AnimatedSection>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection type="fadeInUp">
              <div className="bg-gradient-to-br from-[#FF6B35]/5 to-[#FFB347]/5 border border-gray-200/70 dark:border-gray-700/70 rounded-3xl p-7 sm:p-9">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {[
                    { icon: Users, value: "50K+", label: "Active Users" },
                    {
                      icon: Award,
                      value: "100+",
                      label: "Expert Astrologers",
                    },
                    {
                      icon: Shield,
                      value: "99.9%",
                      label: "Secure Transactions",
                    },
                    { icon: TrendingUp, value: "4.8★", label: "App Rating" },
                  ].map((stat, i) => (
                    <AnimatedSection key={stat.label} type="scale" delay={i * 0.1}>
                      <div className="text-center group cursor-pointer">
                        <div className="flex justify-center mb-3 sm:mb-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent mb-1.5">
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </div>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Registered Address */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection type="fadeInUp">
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 rounded-2xl p-6 sm:p-8 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Registered Address
                </h3>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed space-y-1.5">
                  <p className="font-semibold text-[#FF6B35] text-base sm:text-lg">
                    GYANITALK TECHNOLOGIES (OPC) PRIVATE LIMITED
                  </p>
                  <p>114 Ostwal Plaza 2, (M CL) Sunderwas</p>
                  <p>Udaipur City, Udaipur, Girwa</p>
                  <p>Rajasthan, India - 313001</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </LandingWrapper>
  );
}