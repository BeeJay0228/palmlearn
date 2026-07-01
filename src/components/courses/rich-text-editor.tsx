"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Bold, Italic, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3,
  Link, Table, Image, AlignLeft, AlignCenter, AlignRight, ChevronDown,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

type TextAlign = "left" | "center" | "right";

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = "200px",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showSource, setShowSource] = useState(false);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleAlign = useCallback((align: TextAlign) => {
    document.execCommand("justify" + align.charAt(0).toUpperCase() + align.slice(1));
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInsertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      exec("createLink", url);
    }
  }, [exec]);

  const handleInsertImage = useCallback(() => {
    const url = prompt("Enter image URL:");
    if (url) {
      exec("insertImage", url);
    }
  }, [exec]);

  const handleInsertTable = useCallback(() => {
    const html = '<table class="min-w-full border-collapse border border-border"><tr><td class="border border-border p-2">&nbsp;</td><td class="border border-border p-2">&nbsp;</td></tr><tr><td class="border border-border p-2">&nbsp;</td><td class="border border-border p-2">&nbsp;</td></tr></table><br>';
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInsertAccordion = useCallback(() => {
    const html = '<details class="rounded-lg border border-border mb-2 p-3"><summary class="cursor-pointer font-medium text-content">Section Title</summary><div class="mt-2 text-content-secondary">Content goes here...</div></details><br>';
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInsertCallout = useCallback(() => {
    const html = '<div class="rounded-lg bg-info/10 border border-info/30 p-4 mb-2 text-sm text-content"><strong>Note:</strong> Important information here.</div><br>';
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInsertButton = useCallback(() => {
    const html = '<a href="#" class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">Click Here</a><br><br>';
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  return (
    <div className={cn("rounded-xl border border-border bg-surface overflow-hidden", className)}>
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-border bg-surface-secondary">
        <ToolbarButton icon={Bold} label="Bold" onClick={() => exec("bold")} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => exec("italic")} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton icon={Heading1} label="Heading 1" onClick={() => exec("formatBlock", "h1")} />
        <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => exec("formatBlock", "h2")} />
        <ToolbarButton icon={Heading3} label="Heading 3" onClick={() => exec("formatBlock", "h3")} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton icon={List} label="Bullet List" onClick={() => exec("insertUnorderedList")} />
        <ToolbarButton icon={ListOrdered} label="Ordered List" onClick={() => exec("insertOrderedList")} />
        <ToolbarButton icon={Quote} label="Blockquote" onClick={() => exec("formatBlock", "blockquote")} />
        <ToolbarButton icon={Code} label="Code Block" onClick={() => exec("formatBlock", "pre")} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton icon={AlignLeft} label="Align Left" onClick={() => handleAlign("left")} />
        <ToolbarButton icon={AlignCenter} label="Align Center" onClick={() => handleAlign("center")} />
        <ToolbarButton icon={AlignRight} label="Align Right" onClick={() => handleAlign("right")} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton icon={Link} label="Insert Link" onClick={handleInsertLink} />
        <ToolbarButton icon={Image} label="Insert Image" onClick={handleInsertImage} />
        <ToolbarButton icon={Table} label="Insert Table" onClick={handleInsertTable} />
        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
          >
            Insert
            <ChevronDown className="h-3 w-3" />
          </button>
          <div className="absolute left-0 top-full mt-1 w-44 rounded-xl border border-border bg-surface shadow-xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <button type="button" onClick={() => { handleInsertCallout(); }} className="flex w-full items-center px-4 py-2 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors">Callout</button>
            <button type="button" onClick={() => { handleInsertAccordion(); }} className="flex w-full items-center px-4 py-2 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors">Accordion</button>
            <button type="button" onClick={() => { handleInsertButton(); }} className="flex w-full items-center px-4 py-2 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors">Button</button>
          </div>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowSource(!showSource)}
          className={cn(
            "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
            showSource ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400" : "text-content-secondary hover:text-content hover:bg-surface-hover"
          )}
        >
          &lt;/&gt;
        </button>
      </div>

      {showSource ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none border-0 bg-surface p-4 text-sm font-mono text-content outline-none"
          style={{ minHeight }}
          placeholder={placeholder}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: value }}
          className="w-full resize-none border-0 bg-surface p-4 text-sm text-content outline-none overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      )}
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

function ToolbarButton({ icon: Icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex items-center justify-center rounded-lg h-8 w-8 text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
