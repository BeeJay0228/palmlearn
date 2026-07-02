"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Course, CourseStatus } from "@/types";
import { createCourse, updateCourse } from "@/lib/courses";
import { useAuth } from "@/hooks/use-auth";
import { StepBasicInfo } from "./step-basic-info";
import { StepStructure } from "./step-structure";
import { StepResources } from "./step-resources";
import { CoursePreview } from "./course-preview";
import { StepPublish } from "./step-publish";
import { X, ArrowLeft, ArrowRight, Save, Eye, CheckCircle2, AlertCircle } from "lucide-react";

interface CourseBuilderProps {
  initialData?: Course;
  onClose: () => void;
}

const STEPS = [
  { id: "basic", label: "Basic Information" },
  { id: "structure", label: "Structure" },
  { id: "resources", label: "Resources" },
  { id: "preview", label: "Preview" },
  { id: "publish", label: "Publish" },
];

export function CourseBuilder({ initialData, onClose }: CourseBuilderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<Partial<Course>>(
    initialData || {
      title: "",
      subtitle: "",
      description: "",
      thumbnail: "",
      banner: "",
      instructor: user?.name || "",
      categoryId: "",
      subCategoryId: "",
      estimatedDuration: 0,
      difficulty: "beginner",
      language: "English",
      status: "draft",
      modules: [],
      resources: [],
      tags: [],
      createdBy: user?.id || "",
    }
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!courseData.title?.trim()) errs.title = "Title is required";
    if (!courseData.description?.trim()) errs.description = "Description is required";
    if (!courseData.instructor?.trim()) errs.instructor = "Instructor is required";
    if (!courseData.categoryId) errs.categoryId = "Category is required";
    if (!courseData.estimatedDuration || courseData.estimatedDuration < 1) errs.estimatedDuration = "Duration is required";
    if (!courseData.difficulty) errs.difficulty = "Difficulty is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [courseData]);

  const handleSave = useCallback(async (status?: CourseStatus) => {
    if (!validate()) {
      setCurrentStep(0);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      if (initialData) {
        const updated = updateCourse(initialData.id, { ...courseData, ...(status ? { status } : {}) });
        if (!updated) { setSaveError("Failed to save course."); return; }
        setCourseData(updated);
      } else {
        const created = createCourse({ ...courseData, ...(status ? { status } : {}), createdBy: user?.id || "" });
        setCourseData(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  }, [courseData, initialData, user?.id, validate]);

  const handleStatusChange = useCallback((status: CourseStatus) => {
    setCourseData((prev) => ({ ...prev, status }));
    handleSave(status);
  }, [handleSave]);

  const handleSaveAndClose = useCallback(async () => {
    await handleSave();
    onClose();
    router.refresh();
  }, [handleSave, onClose, router]);

  const goNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const course = courseData as Course;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 lg:px-6 h-16 shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-lg font-semibold text-content">{initialData ? "Edit Course" : "Create Course"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save & Exit"}
          </button>
        </div>
      </header>

      {/* Steps Progress */}
      <div className="flex items-center gap-0 border-b border-border px-4 lg:px-6 shrink-0 overflow-x-auto">
        {STEPS.map((step, idx) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setCurrentStep(idx)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors shrink-0",
              idx === currentStep
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-content-secondary hover:text-content hover:border-border"
            )}
          >
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
              idx === currentStep
                ? "bg-primary-600 text-white"
                : idx < currentStep
                  ? "bg-success/10 text-success"
                  : "bg-surface-secondary text-content-tertiary"
            )}>
              {idx < currentStep ? "✓" : idx + 1}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {saveError && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30 p-4 text-sm text-red-700 dark:text-red-400 mb-4">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {saveError}
          </div>
        )}
        {Object.keys(errors).length > 0 && currentStep === 0 && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 p-4 text-sm text-amber-700 dark:text-amber-400 mb-4">
            <AlertCircle className="h-5 w-5 shrink-0" />
            Please fill in all required fields.
          </div>
        )}
        {currentStep === 0 && <StepBasicInfo data={courseData} onChange={setCourseData} errors={errors} />}
        {currentStep === 1 && <StepStructure course={course} onChange={(c) => setCourseData(c)} />}
        {currentStep === 2 && <StepResources course={course} onChange={(c) => setCourseData(c)} />}
        {currentStep === 3 && <CoursePreview course={course} />}
        {currentStep === 4 && <StepPublish course={course} onStatusChange={handleStatusChange} />}
      </div>

      {/* Footer Navigation */}
      <footer className="flex items-center justify-between border-t border-border px-4 lg:px-6 h-16 shrink-0">
        <p className="text-xs text-content-tertiary">
          Step {currentStep + 1} of {STEPS.length}
        </p>
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          {currentStep < STEPS.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-all"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] bg-surface overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/80 backdrop-blur-xl px-4 lg:px-6 h-16">
            <h2 className="text-lg font-semibold text-content">Course Preview</h2>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
            >
              <X className="h-4 w-4" />
              Close Preview
            </button>
          </div>
          <div className="p-4 lg:p-6">
            <CoursePreview course={course} />
          </div>
        </div>
      )}
    </div>
  );
}
