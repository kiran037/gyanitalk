// ============================================================================
// FILE: components/editor/EnhancedBlogEditor.tsx
// Professional editor with image resize handles and preview modal
// ============================================================================

"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Terminal, Minus, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Palette, Highlighter,
  Upload, X, Eye, Maximize2, GripHorizontal, Calendar, User, Clock, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedBlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  label?: string;
  placeholder?: string;
  blogTitle?: string;
  blogAuthor?: string;
  blogDate?: string;
  blogImage?: string;
}

export interface EnhancedBlogEditorRef {
  insertImage: (url: string) => void;
  getJSON: () => any;
  getHTML: () => string;
  getText: () => string;
}

// ============================================================================
// CUSTOM IMAGE EXTENSION WITH RESIZE
// ============================================================================

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
    };
  },
  
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement('div');
      container.className = 'image-resizer-container';
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.maxWidth = '100%';
      
      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '8px';
      img.style.cursor = 'pointer';
      
      if (node.attrs.width) {
        img.style.width = typeof node.attrs.width === 'number' ? `${node.attrs.width}px` : node.attrs.width;
      }
      
      // Resize handles
      const createHandle = (cursor: string, position: string) => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.style.position = 'absolute';
        handle.style.width = '12px';
        handle.style.height = '12px';
        handle.style.background = '#FF6B35';
        handle.style.border = '2px solid white';
        handle.style.borderRadius = '50%';
        handle.style.cursor = cursor;
        handle.style.display = 'none';
        handle.style.zIndex = '10';
        
        // Position the handle
        if (position === 'nw') {
          handle.style.top = '-6px';
          handle.style.left = '-6px';
        } else if (position === 'ne') {
          handle.style.top = '-6px';
          handle.style.right = '-6px';
        } else if (position === 'sw') {
          handle.style.bottom = '-6px';
          handle.style.left = '-6px';
        } else if (position === 'se') {
          handle.style.bottom = '-6px';
          handle.style.right = '-6px';
        }
        
        let startX: number, startY: number, startWidth: number, startHeight: number;
        
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          startX = e.clientX;
          startY = e.clientY;
          startWidth = img.offsetWidth;
          startHeight = img.offsetHeight;
          
          const onMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = startWidth;
            if (position.includes('e')) {
              newWidth = startWidth + deltaX;
            } else if (position.includes('w')) {
              newWidth = startWidth - deltaX;
            }
            
            newWidth = Math.max(100, Math.min(newWidth, 800));
            img.style.width = `${newWidth}px`;
          };
          
          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Update the node
            if (typeof getPos === 'function') {
              const pos = getPos();
              editor.commands.setNodeSelection(pos);
              editor.commands.updateAttributes('image', {
                width: img.offsetWidth,
              });
            }
          };
          
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
        
        return handle;
      };
      
      const handles = [
        createHandle('nw-resize', 'nw'),
        createHandle('ne-resize', 'ne'),
        createHandle('sw-resize', 'sw'),
        createHandle('se-resize', 'se'),
      ];
      
      container.appendChild(img);
      handles.forEach(handle => container.appendChild(handle));
      
      // Show handles on hover
      container.addEventListener('mouseenter', () => {
        handles.forEach(handle => handle.style.display = 'block');
      });
      
      container.addEventListener('mouseleave', () => {
        handles.forEach(handle => handle.style.display = 'none');
      });
      
      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false;
          img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.width) {
            img.style.width = typeof updatedNode.attrs.width === 'number' 
              ? `${updatedNode.attrs.width}px` 
              : updatedNode.attrs.width;
          }
          return true;
        },
      };
    };
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EnhancedBlogEditor = forwardRef<EnhancedBlogEditorRef, EnhancedBlogEditorProps>(
  function EnhancedBlogEditor(
    { 
      value, 
      onChange, 
      onUploadImage, 
      label, 
      placeholder = "Start writing your blog post...",
      blogTitle = "Your Blog Title",
      blogAuthor = "Author Name",
      blogDate = new Date().toISOString(),
      blogImage = ""
    },
    ref
  ) {
    const [showPreview, setShowPreview] = useState(false);
    const [fontSize, setFontSize] = useState("16");
    const [fontFamily, setFontFamily] = useState("Inter");
    const [textColor, setTextColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffff00");

    // Parse content safely
    const parseContent = (content: string) => {
      if (!content) return "";
      
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
          return parsed;
        }
      } catch (e) {
        // Not JSON
      }
      
      const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        type: "doc",
        content: text ? [{
          type: "paragraph",
          content: [{ type: "text", text: text }]
        }] : [],
      };
    };

    // Initialize editor
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5, 6] },
        }),
        ResizableImage.configure({
          inline: false,
          allowBase64: true,
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        FontFamily,
        Placeholder.configure({ placeholder }),
      ],
      content: parseContent(value),
      onUpdate: ({ editor }) => {
        onChange(JSON.stringify(editor.getJSON()));
      },
      editorProps: {
        attributes: {
          class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8",
        },
      },
    });

    useImperativeHandle(ref, () => ({
      insertImage: (url: string) => {
        if (editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
      getJSON: () => editor?.getJSON() || null,
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
    }));

    const handleImageUpload = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor || !onUploadImage) return;

        try {
          const url = await onUploadImage(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch (err) {
          console.error("Image upload failed", err);
        } finally {
          e.target.value = "";
        }
      },
      [editor, onUploadImage]
    );

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          {/* Toolbar */}
          <EditorToolbar 
            editor={editor} 
            onImageUpload={handleImageUpload}
            onPreview={() => setShowPreview(true)}
          />

          {/* Format Bar */}
          <FormatBar
            editor={editor}
            fontSize={fontSize}
            fontFamily={fontFamily}
            textColor={textColor}
            bgColor={bgColor}
            onFontSizeChange={(size) => {
              setFontSize(size);
              editor?.chain().focus().setMark("textStyle", { fontSize: `${size}px` }).run();
            }}
            onFontFamilyChange={(family) => {
              setFontFamily(family);
              editor?.chain().focus().setFontFamily(family).run();
            }}
            onTextColorChange={(color) => {
              setTextColor(color);
              editor?.chain().focus().setColor(color).run();
            }}
            onHighlightChange={(color) => {
              setBgColor(color);
              editor?.chain().focus().setHighlight({ color }).run();
            }}
          />

          {/* Editor Content */}
          <div className="overflow-y-auto max-h-[600px]">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Preview Modal */}
        {/* <AnimatePresence>
          {showPreview && (
            <PreviewModal
              content={editor.getHTML()}
              onClose={() => setShowPreview(false)}
              blogTitle={blogTitle}
              blogAuthor={blogAuthor}
              blogDate={blogDate}
              blogImage={blogImage}
            />
          )}
        </AnimatePresence> */}

        <style jsx global>{`
          .ProseMirror {
            outline: none;
          }
          .ProseMirror p.is-editor-empty:first-child::before {
            color: #adb5bd;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
          .image-resizer-container {
            margin: 1rem 0;
          }
          .image-resizer-container img {
            display: block;
          }
          .resize-handle:hover {
            transform: scale(1.2);
          }
        `}</style>
      </div>
    );
  }
);

// ============================================================================
// TOOLBAR
// ============================================================================

interface EditorToolbarProps {
  editor: Editor;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreview: () => void;
}

function EditorToolbar({ editor, onImageUpload, onPreview }: EditorToolbarProps) {
  const ToolButton = ({ onClick, active, title, icon }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        active
          ? "bg-[#FF6B35] text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      {/* History */}
      <ToolButton onClick={() => editor.chain().focus().undo().run()} title="Undo" icon={<Undo className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().redo().run()} title="Redo" icon={<Redo className="h-4 w-4" />} />
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Formatting */}
      <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold" icon={<Bold className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic" icon={<Italic className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough" icon={<Strikethrough className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code" icon={<Code className="h-4 w-4" />} />

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Headings */}
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1" icon={<Heading1 className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2" icon={<Heading2 className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3" icon={<Heading3 className="h-4 w-4" />} />

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Lists */}
      <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List" icon={<List className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List" icon={<ListOrdered className="h-4 w-4" />} />

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Alignment */}
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left" icon={<AlignLeft className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center" icon={<AlignCenter className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right" icon={<AlignRight className="h-4 w-4" />} />

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Blocks */}
      <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote" icon={<Quote className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block" icon={<Terminal className="h-4 w-4" />} />
      <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider" icon={<Minus className="h-4 w-4" />} />

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Image */}
      <label className="cursor-pointer p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <ImageIcon className="h-4 w-4" />
        <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
      </label>

      {/* Preview */}
      {/* <div className="ml-auto">
        <button
          type="button"
          onClick={onPreview}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 transition-colors text-sm font-medium"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div> */}
    </div>
  );
}

// ============================================================================
// FORMAT BAR
// ============================================================================

interface FormatBarProps {
  editor: Editor;
  fontSize: string;
  fontFamily: string;
  textColor: string;
  bgColor: string;
  onFontSizeChange: (size: string) => void;
  onFontFamilyChange: (family: string) => void;
  onTextColorChange: (color: string) => void;
  onHighlightChange: (color: string) => void;
}

function FormatBar({
  fontSize, fontFamily, textColor, bgColor,
  onFontSizeChange, onFontFamilyChange, onTextColorChange, onHighlightChange,
}: FormatBarProps) {
  return (
    <div className="flex items-center gap-3 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <select value={fontFamily} onChange={(e) => onFontFamilyChange(e.target.value)} className="text-sm border rounded px-2 py-1 dark:bg-gray-700">
        <option value="Inter">Sans</option>
        <option value="Georgia">Serif</option>
        <option value="Courier New">Mono</option>
      </select>
      <select value={fontSize} onChange={(e) => onFontSizeChange(e.target.value)} className="text-sm border rounded px-2 py-1 dark:bg-gray-700">
        {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
          <option key={size} value={size}>{size}px</option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <Palette className="h-4 w-4 text-gray-500" />
        <input type="color" value={textColor} onChange={(e) => onTextColorChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
      </div>
      <div className="flex items-center gap-1">
        <Highlighter className="h-4 w-4 text-gray-500" />
        <input type="color" value={bgColor} onChange={(e) => onHighlightChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODAL
// ============================================================================

// interface PreviewModalProps {
//   content: string;
//   onClose: () => void;
//   blogTitle: string;
//   blogAuthor: string;
//   blogDate: string;
//   blogImage: string;
// }

// function PreviewModal({ content, onClose, blogTitle, blogAuthor, blogDate, blogImage }: PreviewModalProps) {
//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric", month: "long", day: "numeric"
//     });

//   return (
//     <motion.div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={onClose}
//     >
//       <motion.div
//         className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
//         initial={{ scale: 0.9, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 20 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Modal Header */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//           <div className="flex items-center gap-2">
//             <Eye className="h-5 w-5 text-[#FF6B35]" />
//             <h2 className="text-lg font-bold text-gray-900 dark:text-white">Blog Preview</h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Modal Content - Scrollable */}
//         <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
//           {/* Hero Section (matching frontend) */}
//           <div className="px-6 py-8 sm:px-8">
//             <div className="max-w-4xl mx-auto">
//               <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B35]/10 px-3 py-1 text-sm font-semibold text-[#FF6B35]">
//                 <Tag className="h-3.5 w-3.5" />
//                 Category Name
//               </div>
              
//               <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">
//                 {blogTitle || "Your Blog Title Will Appear Here"}
//               </h1>

//               <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-gray-200/60 pb-6 dark:border-gray-700/60">
//                 <div className="flex items-center gap-2">
//                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B35]/10">
//                     <User className="h-4 w-4 text-[#FF6B35]" />
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">By</p>
//                     <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                       {blogAuthor || "Author Name"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
//                   <div className="flex items-center gap-1">
//                     <Calendar className="h-3.5 w-3.5" />
//                     <span>{formatDate(blogDate)}</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <Clock className="h-3.5 w-3.5" />
//                     <span>5 min</span>
//                   </div>
//                 </div>
//               </div>

//               {blogImage && (
//                 <div className="relative mb-8 h-[320px] overflow-hidden rounded-2xl">
//                   <img src={blogImage} alt={blogTitle} className="h-full w-full object-cover" />
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Blog Content (matching frontend styles) */}
//           <div className="px-6 pb-8 sm:px-8">
//             <div className="max-w-4xl mx-auto">
//               <article className="prose prose-lg dark:prose-invert max-w-none blog-content">
//                 <div dangerouslySetInnerHTML={{ __html: content }} />
//               </article>
//             </div>
//           </div>
//         </div>

//         <style jsx global>{`
//           .blog-content {
//             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
//             line-height: 1.8;
//             color: #374151;
//           }
//           .dark .blog-content { color: #d1d5db; }
//           .blog-content p { margin-bottom: 1.25rem; font-size: 1.0625rem; }
//           .blog-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.1rem; color: #111827; }
//           .dark .blog-content h2 { color: #f9fafb; }
//           .blog-content h3 { font-size: 1.3rem; font-weight: 700; margin-top: 2.2rem; margin-bottom: 0.9rem; color: #1f2937; }
//           .dark .blog-content h3 { color: #f3f4f6; }
//           .blog-content ul, .blog-content ol { margin-bottom: 1.25rem; padding-left: 1.25rem; }
//           .blog-content ul li::marker { color: #ff6b35; }
//           .blog-content strong { color: #111827; font-weight: 600; }
//           .dark .blog-content strong { color: #f9fafb; }
//           .blog-content a { color: #ff6b35; text-decoration: underline; }
//           .blog-content blockquote {
//             border-left: 4px solid #ff6b35;
//             margin: 2rem 0;
//             padding: 1.25rem 1.5rem;
//             font-style: italic;
//             color: #4b5563;
//             background: #fff7ed;
//             border-radius: 0.75rem;
//           }
//           .dark .blog-content blockquote { background: #1f2937; color: #d1d5db; }
//           .blog-content img { border-radius: 1rem; margin: 1.75rem auto; max-width: 100%; height: auto; }
//           .blog-content code {
//             background: #f3f4f6;
//             padding: 0.15rem 0.4rem;
//             border-radius: 0.25rem;
//             font-size: 0.85rem;
//             color: #ff6b35;
//           }
//           .dark .blog-content code { background: #1f2937; color: #ff8c61; }
//         `}</style>
//       </motion.div>
//     </motion.div>
//   );
// }