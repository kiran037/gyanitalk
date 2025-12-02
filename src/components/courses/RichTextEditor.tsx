// components/courses/RichTextEditor.tsx
"use client";

import { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
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

  const toolbarButtons = [
    {
      icon: <Bold className="w-4 h-4" />,
      command: "bold",
      title: "Bold",
    },
    {
      icon: <Italic className="w-4 h-4" />,
      command: "italic",
      title: "Italic",
    },
    {
      icon: <Underline className="w-4 h-4" />,
      command: "underline",
      title: "Underline",
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      command: "formatBlock",
      value: "h3",
      title: "Heading",
    },
    {
      icon: <List className="w-4 h-4" />,
      command: "insertUnorderedList",
      title: "Bullet List",
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      command: "insertOrderedList",
      title: "Numbered List",
    },
    {
      icon: <AlignLeft className="w-4 h-4" />,
      command: "justifyLeft",
      title: "Align Left",
    },
    {
      icon: <AlignCenter className="w-4 h-4" />,
      command: "justifyCenter",
      title: "Align Center",
    },
    {
      icon: <AlignRight className="w-4 h-4" />,
      command: "justifyRight",
      title: "Align Right",
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
            onClick={() => execCommand(btn.command, btn.value)}
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
        className="min-h-[200px] p-4 bg-white dark:bg-gray-800 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
        style={{ whiteSpace: "pre-wrap" }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0.5rem 0;
        }
        [contenteditable] h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}