// components/blog/BlogContentRenderer.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style"; // ✅ Named import
import { Color } from "@tiptap/extension-color"; // ✅ Named import
import { Highlight } from "@tiptap/extension-highlight"; // ✅ Named import
import { FontFamily } from "@tiptap/extension-font-family"; // ✅ Named import

interface BlogContentRendererProps {
  content: string; // JSON string from database
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  // ✅ Parse content safely - handle both JSON and HTML
  const parseContent = (content: string) => {
    if (!content) {
      return {
        type: "doc",
        content: [],
      };
    }
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      // Verify it's valid Tiptap JSON structure
      if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
        return parsed;
      }
    } catch (e) {
      // Not JSON, treat as HTML
    }
    
    // If it's HTML, convert to basic Tiptap structure
    // Strip HTML tags and create simple paragraphs
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    return {
      type: "doc",
      content: text ? [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: text,
            },
          ],
        },
      ] : [],
    };
  };

  let parsedContent;
  try {
    parsedContent = parseContent(content);
  } catch (error) {
    console.error("Failed to parse blog content:", error);
    return (
      <div className="text-red-500 p-4">
        Error: Invalid blog content format
      </div>
    );
  }

  const editor = useEditor({
    immediatelyRender: false, // ✅ Fix SSR hydration issue
    extensions: [
      StarterKit,
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
    ],
    content: parsedContent,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-lg dark:prose-invert max-w-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <article className="blog-content">
      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .blog-content .ProseMirror {
          outline: none;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        /* Additional prose styling */
        .blog-content h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
        }
        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .blog-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .blog-content ul, .blog-content ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        .blog-content li {
          margin: 0.5rem 0;
        }
        .blog-content blockquote {
          border-left: 4px solid #FF6B35;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .blog-content code {
          background-color: rgba(156, 163, 175, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: "Courier New", monospace;
          font-size: 0.875em;
        }
        .blog-content pre {
          background-color: rgba(156, 163, 175, 0.1);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
      `}</style>
    </article>
  );
}