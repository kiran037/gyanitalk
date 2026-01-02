// // src/app/api/landing/astro/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }



    let astrologer = null;

    // ✅ Step 1: Try to find by database slug first
    astrologer = await prisma.astrologers.findFirst({
      where: {
        slug: slug,
        isActive: true,
        isDelete: false,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        slug: true,
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
        email: true,
        contactNo: true,
        gender: true,
        birthDate: true,
        primarySkill: true,
        allSkill: true,
        languageKnown: true,
        profileImage: true,
        charge: true,
        experienceInYears: true,
        dailyContribution: true,
        currentCity: true,
        highestQualification: true,
        degree: true,
        college: true,
        learnAstrology: true,
        isVerified: true,
        isLiveOff: true,
        monthlyEarning: true,
        whatwillDo: true,
        whyOnBoard: true,
        top_badge: true,
        featured_badge: true,
        chatStatus: true,
        chatWaitTime: true,
        callStatus: true,
        callWaitTime: true,
        videoCallRate: true,
        reportRate: true,
        instaProfileLink: true,
        facebookProfileLink: true,
        linkedInProfileLink: true,
        youtubeChannelLink: true,
        websiteProfileLink: true,
        loginBio: true,
        created_at: true,
        updated_at: true,
        stories: {
          where: { created_at: { not: null } },
          select: {
            id: true,
            mediaType: true,
            media: true,
            created_at: true,
            _count: {
              select: { story_view_count: true }
            }
          },
          orderBy: { created_at: "desc" },
          take: 20,
        },
        astrologerGifts: {
          where: { isActive: true, isDelete: false },
          select: {
            id: true,
            giftId: true,
            giftAmount: true,
            created_at: true,
            gift: {
              select: {
                id: true,
                name: true,
                image: true,
                amount: true,
              }
            }
          },
          orderBy: { created_at: "desc" },
          take: 10,
        },
        commissions: {
          where: { isActive: true, isDelete: false },
          select: {
            id: true,
            commissionTypeId: true,
            commission: true,
            created_at: true,
            commissionType: {
              select: {
                id: true,
                name: true,
              }
            }
          },
        },
        reviews: {
          where: { isActive: true, isDelete: false },
          select: {
            id: true,
            rating: true,
            review: true,
            reply: true,
            isPublic: true,
            created_at: true,
            user: {
              select: {
                id: true,
                name: true,
                profile: true,
              }
            }
          },
          orderBy: { created_at: "desc" },
          take: 50,
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          }
        },
        _count: {
          select: {
            followers: true,
            reviews: true,
            chatrequests: true,
            callrequests: true,
            order_requests: true,
          }
        }
      },
    });

    // ✅ Step 2: If not found by slug, check if it's a numeric ID (backward compatibility)
    if (!astrologer) {
      try {
        const astrologerId = BigInt(slug);
        astrologer = await prisma.astrologers.findFirst({
          where: {
            id: astrologerId,
            isActive: true,
            isDelete: false,
          },
          select: {
            id: true,
            userId: true,
            name: true,
            slug: true,
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
            email: true,
            contactNo: true,
            gender: true,
            birthDate: true,
            primarySkill: true,
            allSkill: true,
            languageKnown: true,
            profileImage: true,
            charge: true,
            experienceInYears: true,
            dailyContribution: true,
            currentCity: true,
            highestQualification: true,
            degree: true,
            college: true,
            learnAstrology: true,
            isVerified: true,
            isLiveOff: true,
            monthlyEarning: true,
            whatwillDo: true,
            whyOnBoard: true,
            top_badge: true,
            featured_badge: true,
            chatStatus: true,
            chatWaitTime: true,
            callStatus: true,
            callWaitTime: true,
            videoCallRate: true,
            reportRate: true,
            instaProfileLink: true,
            facebookProfileLink: true,
            linkedInProfileLink: true,
            youtubeChannelLink: true,
            websiteProfileLink: true,
            loginBio: true,
            created_at: true,
            updated_at: true,
            stories: {
              where: { created_at: { not: null } },
              select: {
                id: true,
                mediaType: true,
                media: true,
                created_at: true,
                _count: {
                  select: { story_view_count: true }
                }
              },
              orderBy: { created_at: "desc" },
              take: 20,
            },
            astrologerGifts: {
              where: { isActive: true, isDelete: false },
              select: {
                id: true,
                giftId: true,
                giftAmount: true,
                created_at: true,
                gift: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    amount: true,
                  }
                }
              },
              orderBy: { created_at: "desc" },
              take: 10,
            },
            commissions: {
              where: { isActive: true, isDelete: false },
              select: {
                id: true,
                commissionTypeId: true,
                commission: true,
                created_at: true,
                commissionType: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              },
            },
            reviews: {
              where: { isActive: true, isDelete: false },
              select: {
                id: true,
                rating: true,
                review: true,
                reply: true,
                isPublic: true,
                created_at: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    profile: true,
                  }
                }
              },
              orderBy: { created_at: "desc" },
              take: 50,
            },
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: true,
              }
            },
            _count: {
              select: {
                followers: true,
                reviews: true,
                chatrequests: true,
                callrequests: true,
                order_requests: true,
              }
            }
          },
        });

        if (astrologer) {

        }
      } catch (e) {
        // Not a valid number, try matching against generated slug


        const allAstrologers = await prisma.astrologers.findMany({
          where: {
            isActive: true,
            isDelete: false,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          }
        });

        // Find by generated slug
        astrologer = allAstrologers.find(a => {
          const generatedSlug = (a.slug || a.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''));
          return generatedSlug === slug;
        }) as any || null;

        if (astrologer) {


          // Re-fetch full data
          astrologer = await prisma.astrologers.findFirst({
            where: { id: astrologer.id },
            select: {
              id: true,
              userId: true,
              name: true,
              slug: true,
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
              email: true,
              contactNo: true,
              gender: true,
              birthDate: true,
              primarySkill: true,
              allSkill: true,
              languageKnown: true,
              profileImage: true,
              charge: true,
              experienceInYears: true,
              dailyContribution: true,
              currentCity: true,
              highestQualification: true,
              degree: true,
              college: true,
              learnAstrology: true,
              isVerified: true,
              isLiveOff: true,
              monthlyEarning: true,
              whatwillDo: true,
              whyOnBoard: true,
              top_badge: true,
              featured_badge: true,
              chatStatus: true,
              chatWaitTime: true,
              callStatus: true,
              callWaitTime: true,
              videoCallRate: true,
              reportRate: true,
              instaProfileLink: true,
              facebookProfileLink: true,
              linkedInProfileLink: true,
              youtubeChannelLink: true,
              websiteProfileLink: true,
              loginBio: true,
              created_at: true,
              updated_at: true,
              stories: {
                where: { created_at: { not: null } },
                select: {
                  id: true,
                  mediaType: true,
                  media: true,
                  created_at: true,
                  _count: {
                    select: { story_view_count: true }
                  }
                },
                orderBy: { created_at: "desc" },
                take: 20,
              },
              astrologerGifts: {
                where: { isActive: true, isDelete: false },
                select: {
                  id: true,
                  giftId: true,
                  giftAmount: true,
                  created_at: true,
                  gift: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                      amount: true,
                    }
                  }
                },
                orderBy: { created_at: "desc" },
                take: 10,
              },
              commissions: {
                where: { isActive: true, isDelete: false },
                select: {
                  id: true,
                  commissionTypeId: true,
                  commission: true,
                  created_at: true,
                  commissionType: {
                    select: {
                      id: true,
                      name: true,
                    }
                  }
                },
              },
              reviews: {
                where: { isActive: true, isDelete: false },
                select: {
                  id: true,
                  rating: true,
                  review: true,
                  reply: true,
                  isPublic: true,
                  created_at: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      profile: true,
                    }
                  }
                },
                orderBy: { created_at: "desc" },
                take: 50,
              },
              users: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profile: true,
                }
              },
              _count: {
                select: {
                  followers: true,
                  reviews: true,
                  chatrequests: true,
                  callrequests: true,
                  order_requests: true,
                }
              }
            },
          });
        }
      }
    } else {

    }

    if (!astrologer) {

      return NextResponse.json({ error: "Astrologer not found" }, { status: 404 });
    }



    // ✅ Fetch additional relations not available via direct include
    const [assistants, availabilities, reviewsAgg] = await Promise.all([
      // Assistants
      prisma.astrologer_assistants.findMany({
        where: {
          astrologerId: astrologer.id,
          isActive: true,
          isDelete: false
        },
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          gender: true,
          primarySkill: true,
          allSkill: true,
          languageKnown: true,
          experienceInYears: true,
          profile: true,
        },
      }),

      // Availabilities
      prisma.astrologer_availabilities.findMany({
        where: {
          astrologerId: astrologer.id,
          isActive: true,
          isDelete: false
        },
        select: {
          id: true,
          day: true,
          fromTime: true,
          toTime: true
        },
        orderBy: { id: "asc" },
      }),

      // Aggregate rating stats
      prisma.user_reviews.aggregate({
        where: {
          astrologerId: astrologer.id,
          isActive: true,
          isDelete: false
        },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const avgRating = reviewsAgg._avg?.rating ?? null;
    const reviewsCount = reviewsAgg._count?._all ?? 0;

    // ✅ Fetch skill and language mappings
    const [allSkills, allLanguages] = await Promise.all([
      prisma.skills.findMany({
        where: { isActive: true, isDelete: false },
        select: { id: true, name: true }
      }),
      prisma.languages.findMany({
        select: { id: true, languageName: true }
      })
    ]);

    const skillMap = new Map(allSkills.map(skill => [skill.id.toString(), skill.name]));
    const languageMap = new Map(allLanguages.map(lang => [lang.id.toString(), lang.languageName]));

    // ✅ Convert IDs to names
    const primarySkillName = astrologer.primarySkill
      ? skillMap.get(astrologer.primarySkill) || astrologer.primarySkill
      : null;

    const allSkillNames = astrologer.allSkill
      ? astrologer.allSkill.split(',')
        .map((id: string) => skillMap.get(id.trim()) || id.trim())
        .filter(Boolean)
        .join(', ')
      : null;

    const languageNames = astrologer.languageKnown
      ? astrologer.languageKnown.split(',')
        .map((id: string) => languageMap.get(id.trim()) || id.trim())
        .filter(Boolean)
        .join(', ')
      : null;

    // ✅ Generate slug if missing
    const astrologerSlug = astrologer.slug || astrologer.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // ✅ Build comprehensive SEO
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const astrologerUrl = `${baseUrl}/landing/astro/${astrologerSlug}`;

    const seoData = {
      slug: astrologerSlug,
      metaTitle: astrologer.metaTitle ||
        `${astrologer.name} - Expert ${primarySkillName || 'Astrologer'} | ${astrologer.experienceInYears}+ Years Experience`,
      metaDescription: astrologer.metaDescription ||
        `Consult with ${astrologer.name}, a verified ${primarySkillName || 'astrologer'} with ${astrologer.experienceInYears}+ years of experience. ${astrologer.loginBio?.substring(0, 100) || 'Get expert astrological guidance'}. Starting at ₹${astrologer.charge}/min.`,
      metaKeywords: astrologer.metaKeywords ||
        `${astrologer.name}, ${primarySkillName}, astrologer, online consultation, ${languageNames}, ${astrologer.currentCity || 'India'}`,
      canonicalUrl: astrologer.canonicalUrl || astrologerUrl,
      ogTitle: astrologer.ogTitle || astrologer.metaTitle || astrologer.name,
      ogDescription: astrologer.ogDescription || astrologer.metaDescription ||
        `Expert ${primarySkillName || 'astrologer'} with ${astrologer.experienceInYears}+ years experience`,
      ogImage: astrologer.ogImage || astrologer.profileImage,
      ogUrl: astrologerUrl,
      ogType: 'profile',
      twitterTitle: astrologer.twitterTitle || astrologer.metaTitle || astrologer.name,
      twitterDescription: astrologer.twitterDescription || astrologer.metaDescription,
      twitterImage: astrologer.twitterImage || astrologer.profileImage,
      twitterCard: 'summary_large_image',

      // Schema.org JSON-LD
      schemaJson: astrologer.schemaJson || JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": astrologer.name,
        "jobTitle": primarySkillName || "Astrologer",
        "description": astrologer.loginBio || `Expert ${primarySkillName || 'astrologer'} with ${astrologer.experienceInYears}+ years of experience`,
        "image": astrologer.profileImage,
        "url": astrologerUrl,
        "telephone": astrologer.contactNo,
        "email": astrologer.email,
        "address": astrologer.currentCity ? {
          "@type": "Place",
          "name": astrologer.currentCity
        } : undefined,
        "alumniOf": astrologer.college ? {
          "@type": "Organization",
          "name": astrologer.college
        } : undefined,
        "hasCredential": astrologer.degree ? {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": astrologer.degree
        } : undefined,
        "aggregateRating": avgRating ? {
          "@type": "AggregateRating",
          "ratingValue": avgRating,
          "reviewCount": reviewsCount,
          "bestRating": "5",
          "worstRating": "1"
        } : undefined,
        "offers": {
          "@type": "Offer",
          "price": String(astrologer.charge || ""),
          "priceCurrency": "INR",
          "description": "Chat consultation",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": String(astrologer.charge || ""),
            "priceCurrency": "INR",
            "unitText": "per minute"
          }
        },
        "knowsAbout": allSkillNames ? allSkillNames.split(',').map((s: string) => s.trim()) : [],
        "knowsLanguage": languageNames ? languageNames.split(',').map((l: string) => l.trim()) : []
      }),

      // Breadcrumb Schema
      breadcrumbSchema: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Astrologers",
            "item": `${baseUrl}/landing/astro`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": astrologer.name,
            "item": astrologerUrl
          }
        ]
      })
    };

    // ✅ Build response payload
    const payload = {
      id: astrologer.id.toString(),
      userId: astrologer.userId.toString(),
      name: astrologer.name,
      seo: seoData,
      email: astrologer.email,
      contactNo: astrologer.contactNo,
      gender: astrologer.gender,
      birthDate: astrologer.birthDate,
      primarySkill: primarySkillName, // ✅ Name instead of ID
      allSkill: allSkillNames, // ✅ Names instead of IDs
      languageKnown: languageNames, // ✅ Names instead of IDs
      profileImage: astrologer.profileImage,
      charge: astrologer.charge,
      experienceInYears: astrologer.experienceInYears,
      dailyContribution: astrologer.dailyContribution,
      currentCity: astrologer.currentCity,
      highestQualification: astrologer.highestQualification,
      degree: astrologer.degree,
      college: astrologer.college,
      learnAstrology: astrologer.learnAstrology,
      isVerified: astrologer.isVerified,
      isLiveOff: astrologer.isLiveOff,
      monthlyEarning: astrologer.monthlyEarning,
      whatwillDo: astrologer.whatwillDo,
      whyOnBoard: astrologer.whyOnBoard,
      top_badge: astrologer.top_badge,
      featured_badge: astrologer.featured_badge,
      chatStatus: astrologer.chatStatus,
      chatWaitTime: astrologer.chatWaitTime,
      callStatus: astrologer.callStatus,
      callWaitTime: astrologer.callWaitTime,
      videoCallRate: astrologer.videoCallRate,
      reportRate: astrologer.reportRate,

      // Social links
      socialLinks: {
        instagram: astrologer.instaProfileLink,
        facebook: astrologer.facebookProfileLink,
        linkedin: astrologer.linkedInProfileLink,
        youtube: astrologer.youtubeChannelLink,
        website: astrologer.websiteProfileLink,
      },

      loginBio: astrologer.loginBio,
      created_at: astrologer.created_at,
      updated_at: astrologer.updated_at,

      // Relations
      assistants: assistants.map(a => {
        // Convert assistant's skills/languages too
        const assistantPrimarySkill = a.primarySkill
          ? skillMap.get(a.primarySkill) || a.primarySkill
          : null;
        const assistantAllSkills = a.allSkill
          ? a.allSkill.split(',').map(id => skillMap.get(id.trim()) || id.trim()).join(', ')
          : null;
        const assistantLanguages = a.languageKnown
          ? a.languageKnown.split(',').map(id => languageMap.get(id.trim()) || id.trim()).join(', ')
          : null;

        return {
          id: a.id.toString(),
          name: a.name,
          email: a.email,
          contactNo: a.contactNo,
          gender: a.gender,
          primarySkill: assistantPrimarySkill,
          allSkill: assistantAllSkills,
          languageKnown: assistantLanguages,
          experienceInYears: a.experienceInYears,
          profile: a.profile,
        };
      }),

      availabilities: availabilities.map(av => ({
        id: av.id.toString(),
        day: av.day,
        fromTime: av.fromTime,
        toTime: av.toTime,
      })),

      stories: astrologer.stories.map((s: any) => ({
        id: s.id.toString(),
        mediaType: s.mediaType,
        media: s.media,
        created_at: s.created_at,
        viewCount: s._count.story_view_count,
      })),

      gifts: astrologer.astrologerGifts.map((g: any) => ({
        id: g.id.toString(),
        giftId: g.giftId.toString(),
        giftAmount: g.giftAmount ? g.giftAmount.toString() : null,
        created_at: g.created_at,
        gift: g.gift ? {
          id: g.gift.id.toString(),
          name: g.gift.name,
          image: g.gift.image,
          amount: g.gift.amount,
        } : null,
      })),

      commissions: astrologer.commissions.map((c: any) => ({
        id: c.id.toString(),
        commissionTypeId: c.commissionTypeId.toString(),
        commission: c.commission,
        created_at: c.created_at,
        commissionType: {
          id: c.commissionType.id.toString(),
          name: c.commissionType.name,
        }
      })),

      // Reviews with stats
      reviews: astrologer.reviews.map((r: any) => ({
        id: r.id.toString(),
        rating: r.rating,
        review: r.review,
        reply: r.reply,
        isPublic: r.isPublic,
        created_at: r.created_at,
        user: r.user ? {
          id: r.user.id.toString(),
          name: r.user.name,
          profile: r.user.profile,
        } : null,
      })),
      avgRating: avgRating ? Number(avgRating.toFixed(1)) : null,
      reviewsCount,

      // Counts
      stats: {
        followerCount: astrologer._count.followers,
        reviewCount: astrologer._count.reviews,
        chatRequestCount: astrologer._count.chatrequests,
        callRequestCount: astrologer._count.callrequests,
        orderCount: astrologer._count.order_requests,
      },

      // User/owner info
      user: astrologer.users ? {
        id: astrologer.users.id.toString(),
        name: astrologer.users.name,
        email: astrologer.users.email,
        profile: astrologer.users.profile,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: payload
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'index, follow',
        'Content-Type': 'application/json'
      }
    });

  } catch (err: any) {
    console.error("GET /api/landing/astro/[slug] error:", err);
    return NextResponse.json({
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}