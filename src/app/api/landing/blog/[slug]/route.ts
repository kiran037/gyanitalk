///Users/xeoren/gyanitallk-admin/src/app/api/landing/blog/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

type BlogType = Awaited<ReturnType<typeof prisma.blogs.findFirst>>;

// Helper function to extract plain text from TipTap JSON or HTML
function extractPlainText(content: string): string {
    if (!content) return "";

    const trimmed = content.trim();
    
    // Check if it's TipTap JSON
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed && parsed.type === "doc" && Array.isArray(parsed.content)) {
                // Recursive function to extract text from TipTap nodes
                const extractText = (node: any): string => {
                    if (node.type === "text") {
                        return node.text || "";
                    }
                    if (node.content && Array.isArray(node.content)) {
                        return node.content.map(extractText).join(" ");
                    }
                    return "";
                };
                
                return parsed.content
                    .map(extractText)
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();
            }
        } catch (e) {
            // If JSON parsing fails, fall through to HTML handling
        }
    }
    
    // Handle as HTML
    return content
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

// Helper function to generate comprehensive SEO metadata
function generateCompleteSEO(
    blog: NonNullable<BlogType>,
    categoryName: string | null,
    relatedBlogs: any[]
) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    const plainDescription = extractPlainText(blog.description);
    const excerpt = plainDescription.substring(0, 160);
    const blogUrl = `${baseUrl}/blog/${blog.slug || blog.id}`;

    // ✅ RAW IMAGE (Frontend handles the URL)
    const fullImageUrl = blog.blogImage;

    // Generate reading time (words per minute: 200)
    const wordCount = plainDescription.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Auto-generate keywords if not present
    const autoKeywords = [
        blog.title.toLowerCase(),
        'astrology',
        categoryName?.toLowerCase() || 'horoscope',
        blog.author.toLowerCase(),
        'vedic astrology',
        'astrology blog'
    ].join(', ');

    return {
        // Basic Meta
        metaTitle: blog.metaTitle ||
            `${blog.title} | Astrology Blog by ${blog.author}` ||
            blog.title.substring(0, 60),

        metaDescription: blog.metaDescription ||
            excerpt ||
            `Discover ${blog.title}. Expert astrology insights by ${blog.author}. Read now!`,

        metaKeywords: blog.metaKeywords || autoKeywords,

        canonicalUrl: blog.canonicalUrl || blogUrl,

        // Open Graph (Facebook)
        ogTitle: blog.ogTitle || blog.metaTitle || blog.title,
        ogDescription: blog.ogDescription || blog.metaDescription || excerpt,
        ogImage: blog.ogImage || fullImageUrl,
        ogUrl: blogUrl,
        ogType: 'article',

        // Twitter Card
        twitterTitle: blog.twitterTitle || blog.ogTitle || blog.title,
        twitterDescription: blog.twitterDescription || blog.ogDescription || excerpt,
        twitterImage: blog.twitterImage || blog.ogImage || fullImageUrl,
        twitterCard: 'summary_large_image',

        // Article specific
        articlePublishedTime: blog.postedOn?.toISOString(),
        articleModifiedTime: blog.updated_at?.toISOString(),
        articleAuthor: blog.author,
        articleSection: categoryName || 'Astrology',
        articleTag: blog.metaKeywords?.split(',').map(k => k.trim()) || [],

        // Additional metadata
        readingTime,
        wordCount,
        excerpt,

        // Structured Data (JSON-LD)
        schemaJson: blog.schemaJson || JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "image": {
                "@type": "ImageObject",
                // ✅ Using RAW Image Path - Frontend/Client will need to make this absolute if schema is used there
                // BUT for SEO purposes inside this API response, we return raw.
                // NOTE: If you use this JSON-LD directly in <head>, you might want absolute URL here.
                // However, you asked to let image.ts handle images. 
                // Standard Schema usually needs absolute URLs.
                // Since this is an API route returning JSON, the consumer (page.tsx) 
                // should probably use a helper to make it absolute for SEO tags.
                "url": fullImageUrl, 
                "width": 1200,
                "height": 630
            },
            "author": {
                "@type": "Person",
                "name": blog.author,
                "url": `${baseUrl}/author/${encodeURIComponent(blog.author)}`
            },
            "publisher": {
                "@type": "Organization",
                "name": "Gyanitalk Astrology",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${baseUrl}/logo.png`
                }
            },
            "datePublished": blog.postedOn?.toISOString(),
            "dateModified": blog.updated_at?.toISOString(),
            "description": excerpt,
            "articleBody": plainDescription,
            "keywords": blog.metaKeywords || autoKeywords,
            "articleSection": categoryName || "Astrology",
            "wordCount": wordCount,
            "url": blogUrl,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": blogUrl
            },
            "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/ReadAction",
                "userInteractionCount": blog.viewer?.toString() || "0"
            },
            "about": {
                "@type": "Thing",
                "name": categoryName || "Astrology"
            }
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
                    "name": "Blog",
                    "item": `${baseUrl}/blog`
                },
                ...(categoryName ? [{
                    "@type": "ListItem",
                    "position": 3,
                    "name": categoryName,
                    "item": `${baseUrl}/blog?categoryId=${blog.blogCategoryId}`
                }] : []),
                {
                    "@type": "ListItem",
                    "position": categoryName ? 4 : 3,
                    "name": blog.title,
                    "item": blogUrl
                }
            ]
        }),

        // FAQ Schema (if applicable - can be extracted from content)
        faqSchema: null,

        // Related Articles Schema
        relatedArticlesSchema: relatedBlogs.length > 0 ? JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": relatedBlogs.map((rb, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `${baseUrl}/blog/${rb.slug || rb.id}`
            }))
        }) : null,

        // Social Media Share URLs
        shareUrls: {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(blogUrl)}&text=${encodeURIComponent(blog.title)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + blogUrl)}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(blogUrl)}&media=${encodeURIComponent(fullImageUrl)}&description=${encodeURIComponent(blog.title)}`,
            email: `mailto:?subject=${encodeURIComponent(blog.title)}&body=${encodeURIComponent(blogUrl)}`
        }
    };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        let blog = null;

        // Try to find by database slug first
        blog = await prisma.blogs.findFirst({
            where: {
                slug: slug,
                isActive: true,
                isDelete: false,
            },
        });

        // If not found by slug, check if it's a numeric ID or match generated slug
        if (!blog) {
            try {
                const blogId = BigInt(slug);
                blog = await prisma.blogs.findFirst({
                    where: {
                        id: blogId,
                        isActive: true,
                        isDelete: false,
                    },
                });

            } catch (e) {
                const allBlogs = await prisma.blogs.findMany({
                    where: {
                        isActive: true,
                        isDelete: false,
                    },
                });

                // Find by generated slug
                blog = allBlogs.find(b => {
                    const generatedSlug = (b.slug || b.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, ''));
                    return generatedSlug === slug;
                }) || null;
            }
        }

        if (!blog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 }
            );
        }

        // Increment viewer count asynchronously
        prisma.blogs.update({
            where: { id: blog.id },
            data: { viewer: { increment: 1 } }
        }).catch(err => console.error("Failed to increment view:", err));

        // Get category details
        let category = null;
        if (blog.blogCategoryId) {
            category = await prisma.blog_categories.findFirst({
                where: {
                    id: blog.blogCategoryId,
                    isActive: true,
                    isDelete: false
                }
            });
        }

        // Get related blogs
        const relatedBlogsQuery = await prisma.blogs.findMany({
            where: {
                ...(blog.blogCategoryId && { blogCategoryId: blog.blogCategoryId }),
                id: { not: blog.id },
                isActive: true,
                isDelete: false,
            },
            take: 6,
            orderBy: [
                { viewer: 'desc' },
                { postedOn: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                slug: true,
                blogImage: true,
                viewer: true,
                postedOn: true,
                author: true,
                description: true
            }
        });

        // Get prev/next and author blogs
        const [prevBlog, nextBlog, authorBlogs] = await Promise.all([
            prisma.blogs.findFirst({
                where: {
                    postedOn: { lt: blog.postedOn || new Date() },
                    isActive: true,
                    isDelete: false
                },
                orderBy: { postedOn: 'desc' },
                select: { id: true, title: true, slug: true }
            }),
            prisma.blogs.findFirst({
                where: {
                    postedOn: { gt: blog.postedOn || new Date() },
                    isActive: true,
                    isDelete: false
                },
                orderBy: { postedOn: 'asc' },
                select: { id: true, title: true, slug: true }
            }),
            prisma.blogs.findMany({
                where: {
                    author: blog.author,
                    id: { not: blog.id },
                    isActive: true,
                    isDelete: false
                },
                take: 3,
                orderBy: { postedOn: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    blogImage: true,
                    postedOn: true
                }
            })
        ]);

        // Serialize with slug generation and PROPER excerpt extraction
        const relatedBlogs = relatedBlogsQuery.map((b: any) => {
            const plainText = extractPlainText(b.description);
            const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
            
            return {
                ...b,
                id: b.id.toString(),
                slug: b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                viewer: b.viewer?.toString() || "0",
                // ✅ RAW IMAGE PATH
                blogImage: b.blogImage,
                excerpt: excerpt
            };
        });

        const seo = generateCompleteSEO(blog, category?.name || null, relatedBlogs);

        const serializedBlog = {
            ...blog,
            id: blog.id.toString(),
            slug: blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            blogCategoryId: blog.blogCategoryId?.toString() || null,
            viewer: (blog.viewer || BigInt(0)).toString(),
            category: category ? {
                id: category.id.toString(),
                name: category.name
            } : null,
            // ✅ RAW IMAGE PATH
            blogImage: blog.blogImage,
            // ✅ RAW IMAGE PATH
            previewImage: blog.previewImage || null,
            seo
        };

        const serializedAuthorBlogs = authorBlogs.map(b => ({
            ...b,
            id: b.id.toString(),
            slug: b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            // ✅ RAW IMAGE PATH
            blogImage: b.blogImage
        }));

        return NextResponse.json({
            success: true,
            data: serializedBlog,
            relatedBlogs,
            authorBlogs: serializedAuthorBlogs,
            navigation: {
                prev: prevBlog ? {
                    ...prevBlog,
                    id: prevBlog.id.toString(),
                    slug: prevBlog.slug || prevBlog.id.toString()
                } : null,
                next: nextBlog ? {
                    ...nextBlog,
                    id: nextBlog.id.toString(),
                    slug: nextBlog.slug || nextBlog.id.toString()
                } : null
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                'X-Robots-Tag': 'index, follow, max-image-preview:large',
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error("Blog detail error:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog details" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Endpoint to track blog views
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> } // Note: Route param is slug here too
) {
    try {
        const { slug } = await params;

        let blogId: bigint;

        // Try to find by slug first
        const blogBySlug = await prisma.blogs.findFirst({
            where: { slug: slug, isActive: true, isDelete: false },
            select: { id: true }
        });

        if (blogBySlug) {
            blogId = blogBySlug.id;
        } else {
            // Fallback to trying ID if numeric
            try {
               blogId = BigInt(slug);
            } catch {
               // If not numeric and not found by slug field, check generated slugs
               const allBlogs = await prisma.blogs.findMany({ select: { id: true, title: true, slug: true }});
               const found = allBlogs.find(b => {
                 const genSlug = (b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                 return genSlug === slug;
               });
               if(!found) throw new Error("Blog not found");
               blogId = found.id;
            }
        }

        await prisma.blogs.update({
            where: { id: blogId },
            data: { viewer: { increment: 1 } }
        });

        return NextResponse.json({
            success: true,
            message: "View count updated"
        });

    } catch (error) {
        console.error("View count error:", error);
        return NextResponse.json(
            { error: "Failed to update view count" },
            { status: 500 }
        );
    }
}