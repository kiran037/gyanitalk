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
import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Terminal,
  Minus,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Palette,
  Highlighter,
  Settings,
  X,
  Maximize2,
  RotateCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type ImageAttrs = {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  float?: string;
  borderRadius?: number;
  caption?: string;
};

// ============================================================================
// CUSTOM RESIZABLE IMAGE EXTENSION
// ============================================================================

const ResizableImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      float: { default: "none" },
      borderRadius: { default: 8 },
      caption: { default: "" },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement("div");

      container.className = "image-wrapper";
      if (node.attrs.float === "left") {
        container.classList.add("blog-image-float-left");
      } else if (node.attrs.float === "right") {
        container.classList.add("blog-image-float-right");
      } else if (node.attrs.float === "center") {
        container.classList.add("blog-image-center");
      }
      container.style.position = "relative";
      container.style.display = "block";
      container.style.maxWidth = "100%";
      container.style.margin = "16px 0";

      // Apply float styling
      if (node.attrs.float === "left") {
        container.style.float = "left";
        container.style.marginRight = "16px";
        container.style.marginBottom = "8px";
      } else if (node.attrs.float === "right") {
        container.style.float = "right";
        container.style.marginLeft = "16px";
        container.style.marginBottom = "8px";
      } else if (node.attrs.float === "center") {
        container.style.display = "block";
        container.style.margin = "16px auto";
        container.style.textAlign = "center";
      }
      // Set container width with proper constraints
      if (node.attrs.width) {
        container.style.width = `min(${node.attrs.width}px, 100%)`;
        container.style.maxWidth = "100%";
      } else {
        container.style.width = "fit-content";
      }

      const imageContainer = document.createElement("div");
      imageContainer.style.position = "relative";
      imageContainer.style.display = "inline-block";
      imageContainer.style.lineHeight = "0";

      const img = document.createElement("img");
      img.draggable = false;
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      img.style.display = "block";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.borderRadius = `${node.attrs.borderRadius || 8}px`;
      img.style.cursor = "pointer";
      img.style.transition = "box-shadow 0.2s";

      if (node.attrs.width) {
        img.style.width = `${node.attrs.width}px`;
      }

      // Resize handles
      const handles = ["nw", "ne", "sw", "se"].map((position) => {
        const handle = document.createElement("div");
        handle.className = `resize-handle resize-${position}`;
        handle.style.position = "absolute";
        handle.style.width = "12px";
        handle.style.height = "12px";
        handle.style.background = "#FF6B35";
        handle.style.border = "2px solid white";
        handle.style.borderRadius = "50%";
        handle.style.cursor = "nwse-resize";
        handle.style.opacity = "0";
        handle.style.transition = "opacity 0.2s";
        handle.style.zIndex = "10";
        handle.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

        if (position === "nw") {
          handle.style.top = "-6px";
          handle.style.left = "-6px";
          handle.style.cursor = "nw-resize";
        } else if (position === "ne") {
          handle.style.top = "-6px";
          handle.style.right = "-6px";
          handle.style.cursor = "ne-resize";
        } else if (position === "sw") {
          handle.style.bottom = "-6px";
          handle.style.left = "-6px";
          handle.style.cursor = "sw-resize";
        } else {
          handle.style.bottom = "-6px";
          handle.style.right = "-6px";
          handle.style.cursor = "se-resize";
        }

        return handle;
      });

      imageContainer.appendChild(img);
      handles.forEach((h) => imageContainer.appendChild(h));

      let captionEl: HTMLDivElement | null = null;
      if (node.attrs.caption) {
        captionEl = document.createElement("div");
        captionEl.className = "image-caption";
        captionEl.contentEditable = "true";
        captionEl.spellcheck = false;
        captionEl.textContent = node.attrs.caption;
        captionEl.style.fontSize = "13px";
        captionEl.style.color = "#666";
        captionEl.style.textAlign = "center";
        captionEl.style.marginTop = "8px";
        captionEl.style.fontStyle = "italic";
        captionEl.style.lineHeight = "1.4";
        captionEl.style.padding = "4px";
        captionEl.style.outline = "none";

        captionEl.addEventListener("blur", () => {
          const pos = getPos();
          if (typeof pos === "number") {
            editor.commands.updateAttributes("image", {
              caption: captionEl!.textContent || "",
            });
          }
        });

        captionEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            img.click();
          }
        });
      }

      container.appendChild(imageContainer);
      if (captionEl) container.appendChild(captionEl);

      imageContainer.addEventListener("mouseenter", () => {
        if (!editor.isEditable) return;
        handles.forEach((h) => (h.style.opacity = "1"));
        img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      });

      imageContainer.addEventListener("mouseleave", () => {
        if (!container.dataset.resizing) {
          handles.forEach((h) => (h.style.opacity = "0"));
          img.style.boxShadow = "none";
        }
      });

      handles.forEach((handle, idx) => {
        handle.addEventListener("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();

          container.dataset.resizing = "true";
          const startX = e.clientX;
          const startWidth = img.offsetWidth;
          const startHeight = img.offsetHeight;
          const aspectRatio = startWidth / startHeight;

          const onMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            let newWidth = startWidth;

            if (idx === 0 || idx === 2) {
              newWidth = startWidth - deltaX;
            } else {
              newWidth = startWidth + deltaX;
            }

            newWidth = Math.max(100, Math.min(1000, newWidth));
            const newHeight = newWidth / aspectRatio;

            img.style.width = `${newWidth}px`;
            img.style.height = `${newHeight}px`;
          };

          const onMouseUp = () => {
            delete container.dataset.resizing;
            handles.forEach((h) => (h.style.opacity = "0"));
            img.style.boxShadow = "none";

            const pos = getPos();
            if (typeof pos === "number") {
              editor.commands.updateAttributes("image", {
                width: img.offsetWidth,
                height: null,
              });
            }

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        });
      });

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "image") return false;

          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || "";

          if (updatedNode.attrs.width) {
            img.style.width = `${updatedNode.attrs.width}px`;
          }

          img.style.borderRadius = `${updatedNode.attrs.borderRadius || 8}px`;

          container.style.float = "none";
          container.style.margin = "16px 0";
          container.style.marginLeft = "0";
          container.style.marginRight = "0";
          container.style.display = "block";

          if (updatedNode.attrs.float === "left") {
            container.style.float = "left";
            container.style.marginRight = "16px";
            container.style.marginBottom = "8px";
          } else if (updatedNode.attrs.float === "right") {
            container.style.float = "right";
            container.style.marginLeft = "16px";
            container.style.marginBottom = "8px";
          } else if (updatedNode.attrs.float === "center") {
            container.style.display = "block";
            container.style.margin = "16px auto";
          }

          // Update container width with proper constraints
          if (updatedNode.attrs.width) {
            container.style.width = `min(${updatedNode.attrs.width}px, 100%)`;
            container.style.maxWidth = "100%";
          } else {
            container.style.width = "fit-content";
          }

          if (captionEl) {
            if (updatedNode.attrs.caption) {
              captionEl.textContent = updatedNode.attrs.caption;
            } else {
              captionEl.remove();
              captionEl = null;
            }
          } else if (updatedNode.attrs.caption) {
            captionEl = document.createElement("div");
            captionEl.className = "image-caption";
            captionEl.contentEditable = "true";
            captionEl.spellcheck = false;
            captionEl.textContent = updatedNode.attrs.caption;
            captionEl.style.fontSize = "13px";
            captionEl.style.color = "#666";
            captionEl.style.textAlign = "center";
            captionEl.style.marginTop = "8px";
            captionEl.style.fontStyle = "italic";
            captionEl.style.lineHeight = "1.4";
            captionEl.style.padding = "4px";
            captionEl.style.outline = "none";

            captionEl.addEventListener("blur", () => {
              const pos = getPos();
              if (typeof pos === "number") {
                editor.commands.updateAttributes("image", {
                  caption: captionEl!.textContent || "",
                });
              }
            });

            container.appendChild(captionEl);
          }

          return true;
        },
      };
    };
  },
});

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ProBlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  label?: string;
  placeholder?: string;
}

export interface ProBlogEditorRef {
  insertImage: (url: string) => void;
  getJSON: () => any;
  getHTML: () => string;
  getText: () => string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ProBlogEditor = forwardRef<ProBlogEditorRef, ProBlogEditorProps>(
  function ProBlogEditor(
    {
      value,
      onChange,
      onUploadImage,
      label,
      placeholder = "Start writing your amazing blog post...",
    },
    ref,
  ) {
    const [showImagePanel, setShowImagePanel] = useState(false);
    const [selectedImageAttrs, setSelectedImageAttrs] =
      useState<ImageAttrs | null>(null);
    const [lineHeight, setLineHeight] = useState(1.6);
    const [paragraphSpacing, setParagraphSpacing] = useState(16);

    const parseContent = (content: string) => {
      if (!content) return "";

      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object" && parsed.type === "doc") {
          return parsed;
        }
      } catch (e) {
        // Not JSON
      }

      const text = content
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return {
        type: "doc",
        content: text
          ? [
              {
                type: "paragraph",
                content: [{ type: "text", text: text }],
              },
            ]
          : [],
      };
    };

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
        Placeholder.configure({
          placeholder,
        }),
      ],
      content: parseContent(value),
      onUpdate: ({ editor }) => {
        onChange(JSON.stringify(editor.getJSON()));
      },
      onSelectionUpdate: ({ editor }) => {
        const { selection } = editor.state;
        const node =
          selection.$from.nodeAfter?.type.name === "image"
            ? selection.$from.nodeAfter
            : selection.$from.nodeBefore?.type.name === "image"
              ? selection.$from.nodeBefore
              : null;

        if (!node) {
          setShowImagePanel(false);
          setSelectedImageAttrs(null);
          return;
        }

        setSelectedImageAttrs(node.attrs as ImageAttrs);
        setShowImagePanel(true);
      },
      editorProps: {
        attributes: {
          class: "prose-editor focus:outline-none min-h-[500px] p-8",
        },
      },
    });

    useImperativeHandle(ref, () => ({
      insertImage: (url: string) => {
        if (editor) {
          editor
            .chain()
            .focus()
            .setImage({ src: url })
            .createParagraphNear()
            .run();
        }
      },
      getJSON: () => editor?.getJSON() || null,
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
    }));

    const handleImageUpload = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        if (onUploadImage) {
          try {
            const url = await onUploadImage(file);
            editor.chain().focus().setImage({ src: url }).run();
          } catch (err) {
            console.error("Image upload failed", err);
          } finally {
            e.target.value = "";
          }
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            editor.chain().focus().setImage({ src: url }).run();
          };
          reader.readAsDataURL(file);
          e.target.value = "";
        }
      },
      [editor, onUploadImage],
    );

    if (!editor) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="text-lg text-gray-500">Loading editor...</div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
          <FormatBar editor={editor} />
          <SpacingControls
            lineHeight={lineHeight}
            setLineHeight={setLineHeight}
            paragraphSpacing={paragraphSpacing}
            setParagraphSpacing={setParagraphSpacing}
          />

          <div className="flex">
            <div className="max-h-[600px] flex-1 overflow-y-auto">
              <EditorContent editor={editor} />
            </div>

            {showImagePanel && selectedImageAttrs && (
              <ImageSettingsPanel
                editor={editor}
                attrs={selectedImageAttrs}
                onClose={() => setShowImagePanel(false)}
              />
            )}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{editor.getText().length} characters</span>
              <span>
                {editor.getText().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .prose-editor {
            outline: none;
            font-family:
              -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1f2937;
            line-height: ${lineHeight};
          }

          .prose-editor p {
            margin: ${paragraphSpacing}px 0;
            line-height: inherit;
          }

          .prose-editor h1,
          .prose-editor h2,
          .prose-editor h3,
          .prose-editor h4,
          .prose-editor h5,
          .prose-editor h6 {
            font-weight: 600;
            line-height: 1.3;
            margin-top: ${paragraphSpacing * 1.5}px;
            margin-bottom: ${paragraphSpacing}px;
          }

          .prose-editor h1 {
            font-size: 2.25rem;
          }
          .prose-editor h2 {
            font-size: 1.875rem;
          }
          .prose-editor h3 {
            font-size: 1.5rem;
          }

          .prose-editor ul,
          .prose-editor ol {
            padding-left: 1.5rem;
            margin: ${paragraphSpacing}px 0;
          }

          .prose-editor ul {
            list-style-type: disc;
          }

          .prose-editor ol {
            list-style-type: decimal;
          }

          .prose-editor ul ul {
            list-style-type: circle;
          }

          .prose-editor ul ul ul {
            list-style-type: square;
          }

          .prose-editor li {
            margin: 4px 0;
            padding-left: 0.375rem;
          }

          .prose-editor li p {
            margin: 0;
          }

          .prose-editor blockquote {
            border-left: 4px solid #ff6b35;
            padding-left: 1rem;
            margin: ${paragraphSpacing}px 0;
            font-style: italic;
            color: #6b7280;
          }

          .prose-editor pre {
            background: #1f2937;
            color: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: ${paragraphSpacing}px 0;
          }

          .prose-editor code {
            background: #f3f4f6;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: "Courier New", monospace;
            font-size: 0.875em;
          }

          .prose-editor pre code {
            background: none;
            padding: 0;
          }

          .prose-editor hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: ${paragraphSpacing * 2}px 0;
          }

          .prose-editor p.is-editor-empty:first-child::before {
            color: #9ca3af;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }

          .prose-editor:after {
            content: "";
            display: table;
            clear: both;
          }

          .image-wrapper {
            user-select: none;
          }

          .prose-editor .ProseMirror-selectednode .image-wrapper {
            outline: 2px solid #ff6b35;
            outline-offset: 2px;
            border-radius: 4px;
          }

          .image-caption {
            outline: none;
            cursor: text;
          }

          .image-caption:focus {
            outline: 1px dashed #ff6b35;
            border-radius: 2px;
          }

          .prose-editor a {
            color: #ff6b35;
            text-decoration: underline;
          }

          .prose-editor strong {
            font-weight: 600;
          }

          .prose-editor em {
            font-style: italic;
          }
        `}</style>
      </div>
    );
  },
);

export default ProBlogEditor;

// ============================================================================
// TOOLBAR
// ============================================================================

function EditorToolbar({ editor, onImageUpload }: any) {
  const Button = ({ onClick, active, title, icon, disabled = false }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded p-2 transition-all ${
        active
          ? "bg-[#FF6B35] text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900">
      <Button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
        icon={<Undo className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
        icon={<Redo className="h-4 w-4" />}
      />

      <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
        icon={<Bold className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
        icon={<Italic className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
        icon={<Strikethrough className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
        icon={<Code className="h-4 w-4" />}
      />

      <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
        icon={<Heading1 className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
        icon={<Heading2 className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
        icon={<Heading3 className="h-4 w-4" />}
      />

      <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
        icon={<List className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered List"
        icon={<ListOrdered className="h-4 w-4" />}
      />

      <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <Button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align Left"
        icon={<AlignLeft className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align Center"
        icon={<AlignCenter className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align Right"
        icon={<AlignRight className="h-4 w-4" />}
      />

      <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Quote"
        icon={<Quote className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code Block"
        icon={<Terminal className="h-4 w-4" />}
      />
      <Button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Line"
        icon={<Minus className="h-4 w-4" />}
      />

      <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <label className="cursor-pointer rounded p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
        <ImageIcon className="h-4 w-4" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageUpload}
        />
      </label>
    </div>
  );
}

// ============================================================================
// FORMAT BAR
// ============================================================================

function FormatBar({ editor }: any) {
  const [fontFamily, setFontFamily] = useState("Inter");
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");

  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
      <select
        value={fontFamily}
        onChange={(e) => {
          setFontFamily(e.target.value);
          editor.chain().focus().setFontFamily(e.target.value).run();
        }}
        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-[#FF6B35] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
      >
        <option value="Inter">Inter</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times</option>
      </select>

      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-gray-500" />
        <input
          type="color"
          value={textColor}
          onChange={(e) => {
            setTextColor(e.target.value);
            editor.chain().focus().setColor(e.target.value).run();
          }}
          className="h-8 w-8 cursor-pointer rounded border border-gray-300"
          title="Text Color"
        />
      </div>

      <div className="flex items-center gap-2">
        <Highlighter className="h-4 w-4 text-gray-500" />
        <input
          type="color"
          value={highlightColor}
          onChange={(e) => {
            setHighlightColor(e.target.value);
            editor
              .chain()
              .focus()
              .setHighlight({ color: e.target.value })
              .run();
          }}
          className="h-8 w-8 cursor-pointer rounded border border-gray-300"
          title="Highlight Color"
        />
      </div>
    </div>
  );
}

// ============================================================================
// SPACING CONTROLS
// ============================================================================

function SpacingControls({
  lineHeight,
  setLineHeight,
  paragraphSpacing,
  setParagraphSpacing,
}: any) {
  const presets = [
    { name: "Compact", lineHeight: 1.4, spacing: 8 },
    { name: "Normal", lineHeight: 1.6, spacing: 16 },
    { name: "Relaxed", lineHeight: 1.8, spacing: 24 },
    { name: "Loose", lineHeight: 2.0, spacing: 32 },
  ];

  return (
    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-3 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Spacing Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setLineHeight(preset.lineHeight);
                setParagraphSpacing(preset.spacing);
              }}
              className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-all hover:border-[#FF6B35] hover:bg-[#FF6B35] hover:text-white dark:border-gray-600 dark:text-gray-300"
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-3 w-3 text-gray-500" />
            <ArrowDown className="h-3 w-3 text-gray-500" />
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Line Height: {lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="h-2 w-32 cursor-pointer accent-[#FF6B35]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Paragraph Gap: {paragraphSpacing}px
            </label>
            <input
              type="range"
              min="8"
              max="40"
              step="4"
              value={paragraphSpacing}
              onChange={(e) => setParagraphSpacing(parseInt(e.target.value))}
              className="h-2 w-32 cursor-pointer accent-[#FF6B35]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// IMAGE SETTINGS PANEL
// ============================================================================

function ImageSettingsPanel({
  editor,
  attrs,
  onClose,
}: {
  editor: Editor;
  attrs: ImageAttrs;
  onClose: () => void;
}) {
  const [width, setWidth] = useState(attrs.width || 400);
  const [borderRadius, setBorderRadius] = useState(attrs.borderRadius || 8);
  const [caption, setCaption] = useState(attrs.caption || "");
  const [altText, setAltText] = useState(attrs.alt || "");

  const updateImageAttr = (newAttrs: any) => {
    editor.commands.updateAttributes("image", newAttrs);
  };

  const presetSizes = [
    { label: "Small", value: 200 },
    { label: "Medium", value: 400 },
    { label: "Large", value: 600 },
    { label: "Full", value: 800 },
  ];

  return (
    <div className="w-80 space-y-4 overflow-y-auto border-l border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <Settings className="h-4 w-4" />
          Image Settings
        </h3>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Position & Float */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Position & Text Wrapping
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "none", label: "Block", icon: Maximize2 },
            { value: "left", label: "Float Left", icon: AlignLeft },
            { value: "right", label: "Float Right", icon: AlignRight },
            { value: "center", label: "Center", icon: AlignCenter },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateImageAttr({ float: opt.value })}
              className={`flex items-center justify-center gap-1 rounded border px-3 py-2 text-xs font-medium transition-all ${
                attrs.float === opt.value
                  ? "border-[#FF6B35] bg-[#FF6B35] text-white shadow-md"
                  : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <opt.icon className="h-3 w-3" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Size Presets */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Quick Sizes
        </label>
        <div className="grid grid-cols-4 gap-2">
          {presetSizes.map((size) => (
            <button
              key={size.label}
              onClick={() => {
                setWidth(size.value);
                updateImageAttr({ width: size.value, height: null });
              }}
              className={`rounded border px-2 py-1.5 text-xs font-medium transition-all ${
                width === size.value
                  ? "border-[#FF6B35] bg-[#FF6B35] text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Width Slider */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Width: {width}px
        </label>
        <input
          type="range"
          min="100"
          max="1000"
          step="10"
          value={width}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setWidth(val);
            updateImageAttr({ width: val, height: null });
          }}
          className="w-full accent-[#FF6B35]"
        />
      </div>

      {/* Border Radius */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Border Radius: {borderRadius}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={borderRadius}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setBorderRadius(val);
            updateImageAttr({ borderRadius: val });
          }}
          className="w-full accent-[#FF6B35]"
        />
        <div className="mt-2 flex gap-2">
          {[0, 8, 16, 50].map((r) => (
            <button
              key={r}
              onClick={() => {
                setBorderRadius(r);
                updateImageAttr({ borderRadius: r });
              }}
              className={`flex-1 rounded border px-2 py-1 text-xs font-medium transition-all ${
                borderRadius === r
                  ? "border-[#FF6B35] bg-[#FF6B35] text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {r === 50 ? "Round" : `${r}px`}
            </button>
          ))}
        </div>
      </div>

      {/* Caption */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Caption
        </label>
        <input
          type="text"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={(e) => updateImageAttr({ caption: e.target.value })}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#FF6B35] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Alt Text */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Alt Text (SEO & Accessibility)
        </label>
        <input
          type="text"
          placeholder="Describe the image..."
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          onBlur={(e) => updateImageAttr({ alt: e.target.value })}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#FF6B35] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setWidth(400);
          setBorderRadius(8);
          setCaption("");
          setAltText("");
          updateImageAttr({
            width: 400,
            height: null,
            borderRadius: 8,
            caption: "",
            alt: "",
            float: "none",
          });
        }}
        className="flex w-full items-center justify-center gap-2 rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        <RotateCw className="h-4 w-4" />
        Reset to Defaults
      </button>
    </div>
  );
}






// "use client";

// import React, { useState, useCallback, useRef } from "react";
// // 1. Core Imports
// import {
//   useEditor,
//   EditorContent,
//   NodeViewWrapper,
//   ReactNodeViewRenderer,
//   Editor,
// } from "@tiptap/react";

// // Tiptap v3: Import Menus from the specific subpath
// import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";

// // 2. Extensions
// import StarterKit from "@tiptap/starter-kit";
// import ImageExtension from "@tiptap/extension-image";
// import Link from "@tiptap/extension-link";
// import { Youtube } from "@tiptap/extension-youtube";
// import Underline from "@tiptap/extension-underline";
// import TextAlign from "@tiptap/extension-text-align";
// import { Table } from "@tiptap/extension-table";
// import { TableRow } from "@tiptap/extension-table-row";
// import { TableCell } from "@tiptap/extension-table-cell";
// import { TableHeader } from "@tiptap/extension-table-header";
// import Placeholder from "@tiptap/extension-placeholder";
// import { Color } from "@tiptap/extension-color";
// import { TextStyle } from "@tiptap/extension-text-style";
// import Highlight from "@tiptap/extension-highlight";

// // Import these separately
// import Dropcursor from "@tiptap/extension-dropcursor";
// import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
// import FloatingMenuExtension from "@tiptap/extension-floating-menu";

// import classNames from "classnames";
// import {
//   Bold, Italic, Strikethrough, Underline as UnderlineIcon, Code,
//   Heading1, Heading2, Quote, List, ListOrdered, Link as LinkIcon,
//   Image as ImageIcon, Youtube as YoutubeIcon, Table as TableIcon,
//   AlignLeft, AlignCenter, AlignRight, Undo, Redo,
//   Trash2, GripHorizontal, Layout, Maximize2, Minimize2
// } from "lucide-react";

// // ============================================================================
// // 1. CUSTOM IMAGE COMPONENT
// // ============================================================================

// const ImageNode = ({ node, updateAttributes, selected }: any) => {
//   const [isResizing, setIsResizing] = useState(false);
//   const { src, alt, title, width, align, caption } = node.attrs;
//   const resizeRef = useRef<HTMLDivElement>(null);

//   const handleMouseDown = (e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsResizing(true);
//     const startX = e.clientX;
//     const initialWidth = typeof width === 'number' ? width : parseInt(width, 10) || 400;

//     const onMouseMove = (e: MouseEvent) => {
//       const currentX = e.clientX;
//       const diff = currentX - startX;
//       const newWidth = Math.max(200, Math.min(1200, initialWidth + diff));
//       updateAttributes({ width: newWidth });
//     };

//     const onMouseUp = () => {
//       setIsResizing(false);
//       document.removeEventListener("mousemove", onMouseMove);
//       document.removeEventListener("mouseup", onMouseUp);
//     };

//     document.addEventListener("mousemove", onMouseMove);
//     document.addEventListener("mouseup", onMouseUp);
//   };

//   const wrapperClass = classNames("flex my-6 transition-all duration-200", {
//     "justify-start": align === "left",
//     "justify-center": align === "center",
//     "justify-end": align === "right",
//   });

//   return (
//     <NodeViewWrapper className={wrapperClass}>
//       <div 
//         className={classNames("relative group transition-all", {
//           "ring-2 ring-blue-500 rounded-md": selected || isResizing
//         })}
//         style={{ width: width ? `${width}px` : 'auto', maxWidth: '100%' }}
//       >
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={src}
//           alt={alt}
//           title={title}
//           className="rounded-lg shadow-sm w-full h-auto object-cover block"
//         />
//         <input
//           className="w-full text-center text-sm text-gray-500 mt-2 bg-transparent border-none focus:ring-0 placeholder:text-gray-300 focus:outline-none"
//           placeholder="Write a caption..."
//           value={caption || ""}
//           onChange={(e) => updateAttributes({ caption: e.target.value })}
//         />
//         <div
//           ref={resizeRef}
//           onMouseDown={handleMouseDown}
//           className={classNames(
//             "absolute -right-3 bottom-8 w-6 h-6 bg-white border border-gray-300 rounded-full shadow-md cursor-ew-resize flex items-center justify-center transition-opacity z-10",
//             { "opacity-100": selected || isResizing, "opacity-0 group-hover:opacity-100": !selected && !isResizing }
//           )}
//         >
//           <GripHorizontal className="w-3 h-3 text-gray-500" />
//         </div>
//       </div>
//     </NodeViewWrapper>
//   );
// };

// // ============================================================================
// // 2. EXTENSIONS CONFIGURATION
// // ============================================================================

// const CustomImage = ImageExtension.extend({
//   addAttributes() {
//     return {
//       ...this.parent?.(),
//       width: { default: 600 },
//       align: { default: "center" },
//       caption: { default: "" },
//     };
//   },
//   addNodeView() {
//     return ReactNodeViewRenderer(ImageNode);
//   },
// });

// const CustomVideo = Youtube.configure({
//   controls: false,
//   nocookie: true,
// });

// // ============================================================================
// // 3. UI COMPONENTS
// // ============================================================================

// const MenuButton = ({ onClick, isActive, icon: Icon, title, disabled, className }: any) => (
//   <button
//     type="button"
//     onClick={onClick}
//     disabled={disabled}
//     title={title}
//     className={classNames(
//       "p-2 rounded-md transition-colors flex items-center justify-center",
//       {
//         "bg-gray-200 text-black dark:bg-gray-700 dark:text-white": isActive,
//         "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400": !isActive,
//         "opacity-50 cursor-not-allowed": disabled,
//       },
//       className
//     )}
//   >
//     <Icon className="w-4 h-4" />
//   </button>
// );

// const Toolbar = ({ editor, onImageUpload, onAddYoutube }: any) => {
//   if (!editor) return null;

//   return (
//     <div className="sticky top-0 z-20 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 flex flex-wrap items-center gap-1 shadow-sm">
//       <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
//         <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={Undo} title="Undo" />
//         <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={Redo} title="Redo" />
//       </div>
//       <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
//         <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
//         <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
//         <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
//         <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
//         <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} icon={Code} title="Code" />
//       </div>
//       <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
//         <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} title="H1" />
//         <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="H2" />
//         <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="Quote" />
//       </div>
//       <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
//         <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Bullet List" />
//         <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
//       </div>
//       <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1 hidden sm:flex">
//         <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Left" />
//         <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Center" />
//         <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Right" />
//       </div>
//       <div className="flex gap-1 items-center">
//         <label className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-center" title="Insert Image">
//           <ImageIcon className="w-4 h-4" />
//           <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
//         </label>
//         <MenuButton onClick={onAddYoutube} icon={YoutubeIcon} title="Insert Video" />
//         <MenuButton 
//           onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
//           icon={TableIcon} 
//           title="Insert Table" 
//         />
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // 4. MAIN EDITOR COMPONENT
// // ============================================================================

// interface ProEditorProps {
//   value: string;
//   onChange: (value: string) => void;
//   onImageUpload?: (file: File) => Promise<string>;
// }

// export default function ProBlogEditor({ value, onChange, onImageUpload }: ProEditorProps) {
  
//   const editor = useEditor({
//     immediatelyRender: false,
//     extensions: [
//       // StarterKit includes History by default - just use it
//       StarterKit.configure({
//         heading: { levels: [1, 2, 3, 4, 5, 6] },
//       }),
      
//       // Dropcursor as standalone
//       Dropcursor.configure({ color: "#555", width: 2 }),
      
//       // Logic for Menus
//       BubbleMenuExtension,
//       FloatingMenuExtension,

//       // Other Extensions
//       CustomImage,
//       Link.configure({ openOnClick: false, autolink: true }),
//       CustomVideo,
//       Underline,
//       TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
//       Table.configure({ resizable: true }),
//       TableRow,
//       TableHeader,
//       TableCell,
//       TextStyle,
//       Color,
//       Highlight.configure({ multicolor: true }),
//       Placeholder.configure({ placeholder: "Tell your story..." }),
//     ],
//     content: value,
//     editorProps: {
//       attributes: {
//         class: "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6",
//       },
//     },
//     onUpdate: ({ editor }) => {
//       onChange(editor.getHTML());
//     },
//   });

//   const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !editor) return;

//     if (onImageUpload) {
//       try {
//         const url = await onImageUpload(file);
//         editor.chain().focus().setImage({ src: url }).run();
//       } catch (error) {
//         console.error("Upload failed", error);
//       }
//     } else {
//       const reader = new FileReader();
//       reader.onload = () => {
//         editor.chain().focus().setImage({ src: reader.result as string }).run();
//       };
//       reader.readAsDataURL(file);
//     }
//     e.target.value = "";
//   }, [editor, onImageUpload]);

//   const addYoutubeVideo = useCallback(() => {
//     const url = prompt("Enter YouTube URL");
//     if (url && editor) {
//       editor.commands.setYoutubeVideo({ src: url });
//     }
//   }, [editor]);

//   const setLink = useCallback(() => {
//     const previousUrl = editor?.getAttributes('link').href;
//     const url = window.prompt('URL', previousUrl);
//     if (url === null) return;
//     if (url === '') {
//       editor?.chain().focus().extendMarkRange('link').unsetLink().run();
//       return;
//     }
//     editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
//   }, [editor]);

//   if (!editor) return <div className="p-8 text-center text-gray-500">Loading editor...</div>;

//   return (
//     <div className="w-full max-w-5xl mx-auto border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-950 flex flex-col h-[85vh]">
      
//       <Toolbar editor={editor} onImageUpload={handleImageUpload} onAddYoutube={addYoutubeVideo} />

//       {/* 
//         TIPTAP V3 FIX:
//         1. Removed `duration: 100` from `options` because floating-ui (v3) does not support it.
//         2. Use `options` prop instead of `tippyOptions`.
//       */}
//       <BubbleMenu editor={editor}>
//         <div className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg p-1 flex items-center gap-1">
//           <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
//           <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
//           <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} />
//           <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} icon={Layout} title="Highlight" />
//           <div className="w-px h-4 bg-gray-300 mx-1" />
//           <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
//           <MenuButton onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} />
//         </div>
//       </BubbleMenu>

//       <FloatingMenu editor={editor}>
//         <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-1 flex items-center gap-1">
//            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={Heading1} title="H1" />
//            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={Heading2} title="H2" />
//            <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} icon={List} title="List" />
//         </div>
//       </FloatingMenu>

//       <BubbleMenu 
//         editor={editor} 
//         options={{ placement: 'bottom' }} // placement is still valid in floating-ui
//         shouldShow={({ editor }: { editor: Editor }) => editor.isActive('image')}
//       >
//         <div className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg p-1 flex items-center gap-1">
//            <MenuButton onClick={() => editor.chain().focus().updateAttributes('image', { align: 'left' }).run()} isActive={editor.isActive('image', { align: 'left' })} icon={AlignLeft} />
//            <MenuButton onClick={() => editor.chain().focus().updateAttributes('image', { align: 'center' }).run()} isActive={editor.isActive('image', { align: 'center' })} icon={AlignCenter} />
//            <MenuButton onClick={() => editor.chain().focus().updateAttributes('image', { align: 'right' }).run()} isActive={editor.isActive('image', { align: 'right' })} icon={AlignRight} />
//            <div className="w-px h-4 bg-gray-300 mx-1" />
//            <MenuButton onClick={() => {
//               const currentWidth = parseInt(editor.getAttributes('image').width) || 400;
//               editor.chain().focus().updateAttributes('image', { width: currentWidth + 50 }).run();
//            }} icon={Maximize2} title="Bigger" />
//            <MenuButton onClick={() => {
//               const currentWidth = parseInt(editor.getAttributes('image').width) || 400;
//               editor.chain().focus().updateAttributes('image', { width: Math.max(100, currentWidth - 50) }).run();
//            }} icon={Minimize2} title="Smaller" />
//            <div className="w-px h-4 bg-gray-300 mx-1" />
//            <MenuButton onClick={() => editor.chain().focus().deleteSelection().run()} icon={Trash2} title="Remove" className="text-red-500 hover:bg-red-50" />
//         </div>
//       </BubbleMenu>

//       <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
//         <EditorContent editor={editor} />
//       </div>

//       <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-xs text-gray-500 flex justify-between">
//         <div className="flex gap-4">
//             <span>{editor.storage.characterCount?.words?.() || 0} words</span>
//             <span>{editor.getText().length} characters</span>
//         </div>
//         <div className="flex gap-2">
//             <span>{editor.isFocused ? 'Writing...' : 'Saved'}</span>
//         </div>
//       </div>

//       <style jsx global>{`
//         .ProseMirror { min-height: 100%; outline: none; }
//         .ProseMirror p.is-editor-empty:first-child::before { color: #adb5bd; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
//         .ProseMirror table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 0; overflow: hidden; }
//         .ProseMirror td, .ProseMirror th { min-width: 1em; border: 2px solid #ced4da; padding: 3px 5px; vertical-align: top; box-sizing: border-box; position: relative; }
//         .ProseMirror th { font-weight: bold; text-align: left; background-color: #f1f3f5; }
//         .ProseMirror .selectedCell:after { z-index: 2; position: absolute; content: ""; left: 0; right: 0; top: 0; bottom: 0; background: rgba(200, 200, 255, 0.4); pointer-events: none; }
//         div[data-youtube-video] { cursor: move; padding-right: 24px; }
//         .ProseMirror a { color: #3b82f6; cursor: pointer; text-decoration: underline; }
//       `}</style>
//     </div>
//   );
// }