"use client";

import { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Link2,
  Code,
  Quote,
  Minus,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = "Enter description...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertHorizontalRule = () => {
    execCommand("insertHorizontalRule");
  };

  const toolbarButtons = [
    {
      icon: <Bold className="w-4 h-4" />,
      command: "bold",
      title: "Bold (Ctrl+B)",
      action: () => execCommand("bold"),
    },
    {
      icon: <Italic className="w-4 h-4" />,
      command: "italic",
      title: "Italic (Ctrl+I)",
      action: () => execCommand("italic"),
    },
    {
      icon: <Underline className="w-4 h-4" />,
      command: "underline",
      title: "Underline (Ctrl+U)",
      action: () => execCommand("underline"),
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      command: "formatBlock",
      title: "Heading",
      action: () => execCommand("formatBlock", "<h3>"),
    },
    {
      icon: <List className="w-4 h-4" />,
      command: "insertUnorderedList",
      title: "Bullet List",
      action: () => execCommand("insertUnorderedList"),
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      command: "insertOrderedList",
      title: "Numbered List",
      action: () => execCommand("insertOrderedList"),
    },
    {
      icon: <Link2 className="w-4 h-4" />,
      command: "createLink",
      title: "Insert Link",
      action: insertLink,
    },
    {
      icon: <Code className="w-4 h-4" />,
      command: "formatBlock",
      title: "Code Block",
      action: () => execCommand("formatBlock", "<pre>"),
    },
    {
      icon: <Quote className="w-4 h-4" />,
      command: "formatBlock",
      title: "Quote",
      action: () => execCommand("formatBlock", "<blockquote>"),
    },
    {
      icon: <Minus className="w-4 h-4" />,
      command: "insertHorizontalRule",
      title: "Horizontal Line",
      action: insertHorizontalRule,
    },
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-lg">
        {toolbarButtons.map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] max-h-[600px] overflow-y-auto p-4 bg-white dark:bg-gray-800 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 prose prose-sm dark:prose-invert max-w-none"
        data-placeholder={placeholder}
      />

      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
        }

        [contenteditable] {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Headings */
        [contenteditable] h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 1rem 0;
          line-height: 1.2;
          color: inherit;
        }

        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.875rem 0;
          line-height: 1.3;
          color: inherit;
        }

        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0.75rem 0;
          line-height: 1.4;
          color: inherit;
        }

        [contenteditable] h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0.625rem 0;
          line-height: 1.5;
          color: inherit;
        }

        /* Paragraphs */
        [contenteditable] p {
          margin: 0.75rem 0;
          line-height: 1.75;
          color: inherit;
        }

        /* Lists */
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
          line-height: 1.75;
        }

        [contenteditable] ul {
          list-style-type: disc;
        }

        [contenteditable] ol {
          list-style-type: decimal;
        }

        [contenteditable] li {
          margin: 0.5rem 0;
          padding-left: 0.25rem;
          color: inherit;
        }

        [contenteditable] ul ul,
        [contenteditable] ol ul {
          list-style-type: circle;
          margin: 0.25rem 0;
        }

        [contenteditable] ul ul ul,
        [contenteditable] ol ol ul {
          list-style-type: square;
        }

        /* Links */
        [contenteditable] a {
          color: #ff6b35;
          text-decoration: underline;
          cursor: pointer;
        }

        [contenteditable] a:hover {
          color: #ffb347;
        }

        /* Strong & Emphasis */
        [contenteditable] strong,
        [contenteditable] b {
          font-weight: 700;
          color: inherit;
        }

        [contenteditable] em,
        [contenteditable] i {
          font-style: italic;
          color: inherit;
        }

        [contenteditable] u {
          text-decoration: underline;
        }

        /* Code */
        [contenteditable] code {
          background-color: rgba(156, 163, 175, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: "Courier New", monospace;
          font-size: 0.875em;
          color: #ff6b35;
        }

        [contenteditable] pre {
          background-color: rgba(156, 163, 175, 0.1);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-family: "Courier New", monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* Blockquote */
        [contenteditable] blockquote {
          border-left: 4px solid #ff6b35;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        /* Horizontal Rule */
        [contenteditable] hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1.5rem 0;
        }

        /* Dark mode adjustments */
        .dark [contenteditable] blockquote {
          color: #9ca3af;
        }

        .dark [contenteditable] hr {
          border-top-color: #374151;
        }

        .dark [contenteditable] code {
          background-color: rgba(156, 163, 175, 0.2);
        }

        .dark [contenteditable] pre {
          background-color: rgba(156, 163, 175, 0.2);
        }

        /* Ensure proper spacing between elements */
        [contenteditable] > *:first-child {
          margin-top: 0;
        }

        [contenteditable] > *:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}