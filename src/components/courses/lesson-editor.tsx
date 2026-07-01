"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Lesson, LessonType } from "@/types";
import { RichTextEditor } from "./rich-text-editor";
import { FileText, Video, FileImage, File, Link, ExternalLink, StickyNote, X, GripVertical } from "lucide-react";

const LESSON_TYPE_OPTIONS: { value: LessonType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "text", label: "Rich Text", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "pdf", label: "PDF", icon: File },
  { value: "image", label: "Image", icon: FileImage },
  { value: "ppt", label: "PowerPoint", icon: File },
  { value: "embed", label: "Website Embed", icon: ExternalLink },
  { value: "attachment", label: "Attachment", icon: Link },
];

interface LessonEditorProps {
  lesson: Lesson;
  onChange: (lesson: Lesson) => void;
  onDelete: () => void;
  index: number;
}

export function LessonEditor({ lesson, onChange, onDelete, index }: LessonEditorProps) {
  const [showNotes, setShowNotes] = useState(!!lesson.notes);

  const update = (field: keyof Lesson, value: string | number | string[]) => {
    onChange({ ...lesson, [field]: value });
  };

  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-4">
      <div className="flex items-center gap-3 mb-4">
        <GripVertical className="h-4 w-4 text-content-tertiary shrink-0 cursor-grab" />
        <span className="text-xs font-semibold text-content-tertiary min-w-[2rem]">{index + 1}.</span>
        <div className="flex-1">
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full bg-transparent border-0 text-sm font-medium text-content outline-none placeholder:text-content-tertiary"
            placeholder="Lesson title"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={cn("rounded-lg p-1.5 transition-colors", showNotes ? "bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400" : "text-content-tertiary hover:text-content-secondary hover:bg-surface-hover")}
            title="Notes"
          >
            <StickyNote className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-content-tertiary hover:text-danger hover:bg-danger/5 transition-colors"
            title="Delete lesson"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {LESSON_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              update("type", opt.value);
              if (opt.value === "embed") update("embedUrl", lesson.embedUrl || "");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              lesson.type === opt.value
                ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400 border border-primary-200 dark:border-primary-800"
                : "text-content-secondary hover:text-content border border-transparent hover:border-border"
            )}
          >
            <opt.icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={lesson.duration || ""}
            onChange={(e) => update("duration", parseInt(e.target.value) || 0)}
            className="h-9 w-28 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="Duration (min)"
          />
          <span className="text-xs text-content-tertiary">minutes</span>
        </div>

        {lesson.type === "text" && (
          <RichTextEditor
            value={lesson.content}
            onChange={(val) => update("content", val)}
            placeholder="Write lesson content..."
            minHeight="180px"
          />
        )}

        {lesson.type === "video" && (
          <input
            type="text"
            value={lesson.content}
            onChange={(e) => update("content", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="Video URL (YouTube, Vimeo, etc.)"
          />
        )}

        {lesson.type === "pdf" && (
          <input
            type="text"
            value={lesson.content}
            onChange={(e) => update("content", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="PDF document URL"
          />
        )}

        {lesson.type === "image" && (
          <input
            type="text"
            value={lesson.content}
            onChange={(e) => update("content", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="Image URL"
          />
        )}

        {lesson.type === "ppt" && (
          <input
            type="text"
            value={lesson.content}
            onChange={(e) => update("content", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="PowerPoint presentation URL"
          />
        )}

        {lesson.type === "embed" && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={lesson.embedUrl || ""}
              onChange={(e) => update("embedUrl", e.target.value)}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
              placeholder="Website URL to embed (e.g., https://example.com)"
            />
            {lesson.embedUrl && (
              <div className="rounded-lg border border-border bg-surface p-2">
                <iframe
                  src={lesson.embedUrl}
                  className="w-full h-64 rounded-lg"
                  title="Embedded content"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}
          </div>
        )}

        {lesson.type === "attachment" && (
          <input
            type="text"
            value={lesson.content}
            onChange={(e) => update("content", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="Attachment URL or file path"
          />
        )}

        {showNotes && (
          <textarea
            value={lesson.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all resize-none"
            placeholder="Instructor notes for this lesson..."
          />
        )}
      </div>
    </div>
  );
}
