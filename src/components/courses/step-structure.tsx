"use client";

import { useState } from "react";
import type { Course, Module, Lesson } from "@/types";
import { LessonEditor } from "./lesson-editor";
import { Plus, GripVertical, ChevronDown, ChevronRight, ChevronUp, Trash2 } from "lucide-react";

interface StepStructureProps {
  course: Course;
  onChange: (course: Course) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function createEmptyModule(): Module {
  return { id: generateId(), title: "", description: "", duration: 0, order: 0, lessons: [] };
}

function createEmptyLesson(): Lesson {
  return { id: generateId(), title: "", type: "text", content: "", duration: 0, order: 0, notes: "", attachments: [], embedUrl: "" };
}

export function StepStructure({ course, onChange }: StepStructureProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addModule = () => {
    const newMod = createEmptyModule();
    newMod.order = course.modules.length;
    const updated = { ...course, modules: [...course.modules, newMod] };
    onChange(updated);
    setExpandedModules((prev) => new Set(prev).add(newMod.id));
    setEditingModule(newMod.id);
  };

  const updateModule = (moduleId: string, field: keyof Module, value: string | number) => {
    const updated = {
      ...course,
      modules: course.modules.map((m) => (m.id === moduleId ? { ...m, [field]: value } : m)),
    };
    onChange(updated);
  };

  const deleteModule = (moduleId: string) => {
    const updated = {
      ...course,
      modules: course.modules.filter((m) => m.id !== moduleId),
    };
    onChange(updated);
  };

  const addLesson = (moduleId: string) => {
    const lesson = createEmptyLesson();
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    lesson.order = mod.lessons.length;
    const updated = {
      ...course,
      modules: course.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m
      ),
    };
    onChange(updated);
  };

  const updateLesson = (moduleId: string, lesson: Lesson) => {
    const updated = {
      ...course,
      modules: course.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.map((l) => (l.id === lesson.id ? lesson : l)) } : m
      ),
    };
    onChange(updated);
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const updated = {
      ...course,
      modules: course.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
      ),
    };
    onChange(updated);
  };

  const moveModuleUp = (idx: number) => {
    if (idx === 0) return;
    const modules = [...course.modules];
    [modules[idx - 1], modules[idx]] = [modules[idx], modules[idx - 1]];
    modules.forEach((m, i) => (m.order = i));
    onChange({ ...course, modules });
  };

  const moveModuleDown = (idx: number) => {
    if (idx === course.modules.length - 1) return;
    const modules = [...course.modules];
    [modules[idx], modules[idx + 1]] = [modules[idx + 1], modules[idx]];
    modules.forEach((m, i) => (m.order = i));
    onChange({ ...course, modules });
  };

  const moveLessonUp = (moduleId: string, idx: number) => {
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod || idx === 0) return;
    const lessons = [...mod.lessons];
    [lessons[idx - 1], lessons[idx]] = [lessons[idx], lessons[idx - 1]];
    lessons.forEach((l, i) => (l.order = i));
    const updated = {
      ...course,
      modules: course.modules.map((m) => (m.id === moduleId ? { ...m, lessons } : m)),
    };
    onChange(updated);
  };

  const moveLessonDown = (moduleId: string, idx: number) => {
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod || idx === mod.lessons.length - 1) return;
    const lessons = [...mod.lessons];
    [lessons[idx], lessons[idx + 1]] = [lessons[idx + 1], lessons[idx]];
    lessons.forEach((l, i) => (l.order = i));
    const updated = {
      ...course,
      modules: course.modules.map((m) => (m.id === moduleId ? { ...m, lessons } : m)),
    };
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-content-secondary">
          {course.modules.length} module{course.modules.length !== 1 ? "s" : ""} ·{" "}
          {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lesson{course.modules.reduce((acc, m) => acc + m.lessons.length, 0) !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={addModule}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Module
        </button>
      </div>

      {course.modules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border bg-surface-secondary/50">
          <p className="text-sm font-medium text-content-secondary">No modules yet</p>
          <p className="text-xs text-content-tertiary mt-1">Click &ldquo;Add Module&rdquo; to start building your course structure</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {course.modules.map((mod, mIdx) => (
          <div key={mod.id} className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-secondary/50">
              <GripVertical className="h-4 w-4 text-content-tertiary shrink-0 cursor-grab" />
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className="flex items-center gap-1 text-content-tertiary hover:text-content-secondary"
              >
                {expandedModules.has(mod.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <div className="flex-1 min-w-0">
                {editingModule === mod.id ? (
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => updateModule(mod.id, "title", e.target.value)}
                    className="w-full bg-transparent border-0 text-sm font-medium text-content outline-none"
                    placeholder="Module title"
                    autoFocus
                    onBlur={() => setEditingModule(null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => { setEditingModule(mod.id); toggleModule(mod.id); }}
                    className="text-sm font-medium text-content hover:text-primary-600 transition-colors text-left"
                  >
                    {mod.title || <span className="text-content-tertiary italic">Untitled Module</span>}
                  </button>
                )}
              </div>
              <span className="text-xs text-content-tertiary">{mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveModuleUp(mIdx)} disabled={mIdx === 0} className="rounded p-1 text-content-tertiary hover:text-content hover:bg-surface-hover disabled:opacity-30 transition-colors"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => moveModuleDown(mIdx)} disabled={mIdx === course.modules.length - 1} className="rounded p-1 text-content-tertiary hover:text-content hover:bg-surface-hover disabled:opacity-30 transition-colors"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => deleteModule(mod.id)} className="rounded p-1 text-content-tertiary hover:text-danger hover:bg-danger/5 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {expandedModules.has(mod.id) && (
              <div className="p-4 flex flex-col gap-3">
                <input
                  type="text"
                  value={mod.description}
                  onChange={(e) => updateModule(mod.id, "description", e.target.value)}
                  className="h-9 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
                  placeholder="Module description (optional)"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={mod.duration || ""}
                    onChange={(e) => updateModule(mod.id, "duration", parseInt(e.target.value) || 0)}
                    className="h-9 w-24 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
                    placeholder="Duration"
                  />
                  <span className="text-xs text-content-tertiary">min</span>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => addLesson(mod.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add Lesson
                  </button>
                </div>

                {mod.lessons.length === 0 && (
                  <p className="text-xs text-content-tertiary text-center py-4">No lessons yet</p>
                )}

                <div className="flex flex-col gap-2">
                  {mod.lessons.map((lesson, lIdx) => (
                    <div key={lesson.id} className="relative">
                      <LessonEditor
                        lesson={lesson}
                        onChange={(l) => updateLesson(mod.id, l)}
                        onDelete={() => deleteLesson(mod.id, lesson.id)}
                        index={lIdx}
                      />
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                        <button type="button" onClick={() => moveLessonUp(mod.id, lIdx)} disabled={lIdx === 0} className="rounded p-0.5 text-content-tertiary hover:text-content hover:bg-surface-hover disabled:opacity-30 transition-colors"><ChevronUp className="h-3 w-3" /></button>
                        <button type="button" onClick={() => moveLessonDown(mod.id, lIdx)} disabled={lIdx === mod.lessons.length - 1} className="rounded p-0.5 text-content-tertiary hover:text-content hover:bg-surface-hover disabled:opacity-30 transition-colors"><ChevronDown className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

