import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

// Type helpers
type BlogType = Awaited<ReturnType<typeof prisma.blogs.findFirst>>;
type CategoryType = Awaited<ReturnType<typeof prisma.blog_categories.findFirst>>;

// Helper function to generate SEO metadata
function generateSEOMetadata(blog: NonNullable<BlogType>, categoryName?: string | null) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    // Extract plain text from HTML description
    const plainDescription = blog.description
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

    return {
        // Title generation with fallbacks
        metaTitle: blog.metaTitle || 
            `${blog.title} | Astrology Blog` ||
            truncateText(blog.title, 60),
        
        // Description generation with fallbacks
        metaDescription: blog.metaDescription || 
            truncateText(plainDescription, 160) ||
            `Read about ${blog.title} and discover insights from our astrology experts.`,
        
        // Keywords generation
        metaKeywords: blog.metaKeywords || 
            `${blog.title}, astrology, ${categoryName || 'horoscope'}, ${blog.author}, astrology blog`,
        
        // Canonical URL
        canonicalUrl: blog.canonicalUrl || 
            `${baseUrl}/blog/${blog.slug || blog.id}`,
        
        // Open Graph
        ogTitle: blog.ogTitle || blog.metaTitle || blog.title,
        ogDescription: blog.ogDescription || blog.metaDescription || truncateText(plainDescription, 200),
        // ✅ RAW IMAGE
        ogImage: blog.ogImage || blog.blogImage,
        
        // Twitter Card
        twitterTitle: blog.twitterTitle || blog.ogTitle || blog.metaTitle || blog.title,
        twitterDescription: blog.twitterDescription || blog.ogDescription || blog.metaDescription || truncateText(plainDescription, 200),
        // ✅ RAW IMAGE
        twitterImage: blog.twitterImage || blog.ogImage || blog.blogImage,
        
        // Schema.org JSON-LD
        schemaJson: blog.schemaJson || JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            // ✅ RAW IMAGE (Frontend handles the URL)
            "image": blog.blogImage,
            "author": {
                "@type": "Person",
                "name": blog.author
            },
            "publisher": {
                "@type": "Organization",
                "name": "Your Astrology Site",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${baseUrl}/logo.png`
                }
            },
            "datePublished": blog.postedOn?.toISOString(),
            "dateModified": blog.updated_at?.toISOString(),
            "description": truncateText(plainDescription, 160),
            "articleBody": plainDescription,
            "keywords": blog.metaKeywords || `astrology, ${categoryName || 'horoscope'}`,
            "articleSection": categoryName || "Astrology"
        })
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const categoryId = searchParams.get("categoryId");
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "latest"; // latest, popular, oldest
        const author = searchParams.get("author");

        const skip = (page - 1) * limit;

        // Build where clause
        const whereClause: any = {
            isActive: true,
            isDelete: false,
        };

        if (categoryId) {
            whereClause.blogCategoryId = BigInt(categoryId);
        }

        if (search) {
            whereClause.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { author: { contains: search } },
                { metaKeywords: { contains: search } }
            ];
        }

        if (author) {
            whereClause.author = { contains: author };
        }

        // Determine sort order
        let orderBy: any = { postedOn: 'desc' }; // default: latest
        
        if (sortBy === 'popular') {
            orderBy = { viewer: 'desc' };
        } else if (sortBy === 'oldest') {
            orderBy = { postedOn: 'asc' };
        }

        // Get blogs with pagination
        const [blogs, totalCount, categories] = await Promise.all([
            prisma.blogs.findMany({
                where: whereClause,
                orderBy,
                skip,
                take: limit,
            }),
            prisma.blogs.count({
                where: whereClause
            }),
            prisma.blog_categories.findMany({
                where: {
                    isActive: true,
                    isDelete: false
                },
                orderBy: {
                    name: 'asc'
                }
            })
        ]);

        // Get category map for SEO generation
        const categoryMap = new Map(
            categories.map(cat => [cat.id.toString(), cat.name])
        );

        const serializedBlogs = blogs.map((blog: NonNullable<BlogType>) => {
            const categoryName = blog.blogCategoryId 
                ? categoryMap.get(blog.blogCategoryId.toString()) 
                : null;
            
            const seoData = generateSEOMetadata(blog, categoryName);
            
            // Generate slug if it doesn't exist
            const generatedSlug = blog.slug || blog.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            
            return {
                ...blog,
                id: blog.id.toString(),
                slug: generatedSlug,
                blogCategoryId: blog.blogCategoryId?.toString() || null,
                viewer: blog.viewer?.toString() || "0",
                // ✅ RAW IMAGE PATH
                blogImage: blog.blogImage,
                categoryName,
                seo: seoData
            };
        });

        const serializedCategories = categories.map((cat: NonNullable<CategoryType>) => ({
            ...cat,
            id: cat.id.toString(),
        }));

        // Generate page-level SEO
        const pageSEO = {
            title: categoryId 
                ? `${categoryMap.get(categoryId)} - Astrology Blog | Page ${page}`
                : `Astrology Blog - Insights & Horoscopes | Page ${page}`,
            description: categoryId
                ? `Explore ${categoryMap.get(categoryId)} articles and insights from expert astrologers.`
                : `Discover astrology insights, horoscopes, and expert advice. Page ${page} of ${Math.ceil(totalCount / limit)}.`,
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog${categoryId ? `?categoryId=${categoryId}` : ''}${page > 1 ? `&page=${page}` : ''}`
        };

        // Get popular blogs (top 5 by views)
        const popularBlogs = await prisma.blogs.findMany({
            where: {
                isActive: true,
                isDelete: false
            },
            orderBy: {
                viewer: 'desc'
            },
            take: 5,
            select: {
                id: true,
                title: true,
                slug: true,
                blogImage: true,
                viewer: true
            }
        });

        // Get recent blogs
        const recentBlogs = await prisma.blogs.findMany({
            where: {
                isActive: true,
                isDelete: false
            },
            orderBy: {
                postedOn: 'desc'
            },
            take: 5,
            select: {
                id: true,
                title: true,
                slug: true,
                blogImage: true,
                postedOn: true
            }
        });

        // Get unique authors
        const authorsResult = await prisma.blogs.findMany({
            where: {
                isActive: true,
                isDelete: false
            },
            select: {
                author: true
            },
            distinct: ['author']
        });
        
        const authors = authorsResult
            .filter(a => a.author && a.author.trim() !== '')
            .map(a => a.author) as string[];

        const serializedPopularBlogs = popularBlogs.map(b => ({
            ...b,
            id: b.id.toString(),
            slug: b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            viewer: b.viewer?.toString() || "0",
            // ✅ RAW IMAGE PATH
            blogImage: b.blogImage
        }));

        const serializedRecentBlogs = recentBlogs.map(b => ({
            ...b,
            id: b.id.toString(),
            slug: b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), // Ensure slug exists for recent too
            // ✅ RAW IMAGE PATH
            blogImage: b.blogImage
        }));

        return NextResponse.json({
            success: true,
            data: serializedBlogs,
            categories: serializedCategories,
            popularBlogs: serializedPopularBlogs,
            recentBlogs: serializedRecentBlogs,
            authors: authors,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                limit,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            },
            seo: pageSEO,
            filters: {
                categoryId,
                search,
                sortBy,
                author
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                'X-Robots-Tag': 'index, follow'
            }
        });
  } catch (error) {
    console.error("Blog list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}