///Users/xeoren/gyanitallk-admin/src/app/api/landing/blog/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

type BlogType = Awaited<ReturnType<typeof prisma.blogs.findFirst>>;

// Helper function to generate comprehensive SEO metadata
function generateCompleteSEO(
    blog: NonNullable<BlogType>,
    categoryName: string | null,
    relatedBlogs: any[]
) {
    const baseUrl = process.env.NEXT_PUBLIC_BASEURL || '';

    // Extract plain text from HTML
    const getPlainText = (html: string) => {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
    };

    const plainDescription = getPlainText(blog.description);
    const excerpt = plainDescription.substring(0, 160);
    const blogUrl = `${baseUrl}/blog/${blog.slug || blog.id}`;
    const fullImageUrl = blog.blogImage.startsWith('http')
        ? blog.blogImage
        : `${baseUrl}${blog.blogImage}`;

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
        faqSchema: null, // Can be populated if you have Q&A in blog

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

        // Try to find by database slug first (for future when slugs are populated)
        blog = await prisma.blogs.findFirst({
            where: {
                slug: slug,
                isActive: true,
                isDelete: false,
            },
        });

        // If not found by slug, check if it's a numeric ID
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

                if (blog) {

                }
            }
        } else {

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

        // Serialize with slug generation
        const relatedBlogs = relatedBlogsQuery.map((b: any) => ({
            ...b,
            id: b.id.toString(),
            slug: b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            viewer: b.viewer?.toString() || "0",
            blogImage: b.blogImage.startsWith('http')
                ? b.blogImage
                : `${process.env.NEXT_PUBLIC_BASEURL || ''}${b.blogImage}`,
            excerpt: b.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
        }));

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
            blogImage: blog.blogImage.startsWith('http')
                ? blog.blogImage
                : `${process.env.NEXT_PUBLIC_BASEURL || ''}${blog.blogImage}`,
            previewImage: blog.previewImage
                ? (blog.previewImage.startsWith('http')
                    ? blog.previewImage
                    : `${process.env.NEXT_PUBLIC_BASEURL || ''}${blog.previewImage}`)
                : null,
            seo
        };

        const serializedAuthorBlogs = authorBlogs.map(b => ({
            ...b,
            id: b.id.toString(),
            slug: b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            blogImage: b.blogImage.startsWith('http')
                ? b.blogImage
                : `${process.env.NEXT_PUBLIC_BASEURL || ''}${b.blogImage}`
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

// Endpoint to track blog views (can be called separately for analytics)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        let blogId: bigint;

        // Try to find by slug first
        const blogBySlug = await prisma.blogs.findFirst({
            where: { slug: id, isActive: true, isDelete: false },
            select: { id: true }
        });

        if (blogBySlug) {
            blogId = blogBySlug.id;
        } else {
            blogId = BigInt(id);
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
    } finally {
        await prisma.$disconnect();
    }
}