"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AUDIENCE_TYPE_LABELS, type TargetAudience, type AudienceType } from "@/types";
import { getCategories, getRegions, getSubCategories, getStates } from "@/lib/organization";
import { getUsers } from "@/lib/users";
import { Users, X, Search } from "lucide-react";

interface TargetAudienceBuilderProps {
  value: TargetAudience;
  onChange: (audience: TargetAudience) => void;
}

export function TargetAudienceBuilder({ value, onChange }: TargetAudienceBuilderProps) {
  const [audienceType, setAudienceType] = useState<AudienceType>(value.type || "single");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = getCategories();
  const regions = getRegions();
  const users = getUsers();

  const allItems = useMemo(() => {
    let items: { id: string; label: string }[] = [];
    switch (audienceType) {
      case "single":
      case "multiple":
        items = users.filter((u) => u.role === "learner" || u.role === "trainer").map((u) => ({ id: u.id, label: `${u.name} (${u.email})` }));
        break;
      case "category":
        items = categories.map((c) => ({ id: c.id, label: c.name }));
        break;
      case "subcategory": {
        items = [];
        categories.forEach((c) => {
          const subs = getSubCategories(c.id);
          subs.forEach((s) => items.push({ id: s.id, label: `${c.name} > ${s.name}` }));
        });
        break;
      }
      case "region":
        items = regions.map((r) => ({ id: r.id, label: r.name }));
        break;
      case "state": {
        items = [];
        regions.forEach((r) => {
          const sts = getStates(r.id);
          sts.forEach((s) => items.push({ id: s.id, label: `${r.name} > ${s.name}` }));
        });
        break;
      }
      case "office":
        items = [{ id: "lagos-main", label: "Lagos Main Office" }, { id: "abuja-branch", label: "Abuja Branch" }, { id: "rivers-branch", label: "Rivers Branch" }];
        break;
      case "trainer_group":
        items = users.filter((u) => u.role === "trainer").map((u) => ({ id: u.id, label: u.name }));
        break;
      case "organization":
        items = [{ id: "all", label: "Entire Organization (All Learners & Trainers)" }];
        break;
    }
    return items;
  }, [audienceType, categories, regions, users]);

  const availableItems = useMemo(() => {
    if (!searchTerm) return allItems;
    const q = searchTerm.toLowerCase();
    return allItems.filter((i) => i.label.toLowerCase().includes(q));
  }, [allItems, searchTerm]);

  const selectedItems = useMemo(() => {
    let ids: string[] = [];
    switch (audienceType) {
      case "single":
      case "multiple": ids = value.userIds; break;
      case "category": ids = value.categoryIds; break;
      case "subcategory": ids = value.subCategoryIds; break;
      case "region": ids = value.regionIds; break;
      case "state": ids = value.stateIds; break;
      case "office":
      case "trainer_group":
      case "organization": ids = value.userIds; break;
    }
    return allItems.filter((i) => ids.includes(i.id));
  }, [allItems, value, audienceType]);

  function getSelectedIds(): string[] {
    switch (audienceType) {
      case "single":
      case "multiple": return value.userIds;
      case "category": return value.categoryIds;
      case "subcategory": return value.subCategoryIds;
      case "region": return value.regionIds;
      case "state": return value.stateIds;
      case "office":
      case "trainer_group":
      case "organization": return value.userIds;
      default: return [];
    }
  }

  function toggleItem(id: string) {
    const current = getSelectedIds();
    const newIds = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
    const update = { ...value, type: audienceType };
    switch (audienceType) {
      case "single":
      case "multiple": update.userIds = newIds; break;
      case "category": update.categoryIds = newIds; break;
      case "subcategory": update.subCategoryIds = newIds; break;
      case "region": update.regionIds = newIds; break;
      case "state": update.stateIds = newIds; break;
      case "office":
      case "trainer_group":
      case "organization": update.userIds = newIds; break;
    }
    onChange(update);
  }

  const estimatedLearners = audienceType === "organization" ? users.filter((u) => u.role !== "admin").length : selectedItems.length;

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-content mb-2 block">Audience Type</label>
        <div className="grid grid-cols-3 gap-2">
          {(["single", "multiple", "category", "subcategory", "region", "state", "office", "trainer_group", "organization"] as AudienceType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => { setAudienceType(type); onChange({ ...value, type }); }}
                className={cn(
                "rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 border text-left",
                audienceType === type
                  ? "bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-950/30 dark:border-primary-700 dark:text-primary-400"
                  : "bg-surface border-border text-content-secondary hover:border-border-strong hover:text-content",
              )}
            >
              {AUDIENCE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {audienceType !== "organization" && (
        <div>
          <label className="text-sm font-medium text-content mb-2 block">
            {audienceType === "single" ? "Select Learner" : `Select ${AUDIENCE_TYPE_LABELS[audienceType]}`}
          </label>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="flex h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all"
            />
          </div>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border/60">
            {availableItems.length === 0 ? (
              <div className="p-4 text-center text-sm text-content-tertiary">No items found</div>
            ) : (
              availableItems.map((item) => {
                const selected = getSelectedIds().includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-secondary/60",
                      selected && "bg-primary-50/50 dark:bg-primary-950/20",
                    )}
                  >
                    <div className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors",
                      selected ? "bg-primary-600 border-primary-600" : "border-border",
                    )}>
                      {selected && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    <span className={cn("text-sm", selected ? "font-medium text-primary-700 dark:text-primary-400" : "text-content")}>
                      {item.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <Card variant="bordered" padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary-600" />
            <span className="text-xs font-medium text-content-secondary">
              {audienceType === "organization" ? "Selected: Entire Organization" : `Selected: ${selectedItems.length} items`}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedItems.map((item) => (
              <Badge key={item.id} variant="secondary" size="sm">
                {item.label}
                <button type="button" onClick={() => toggleItem(item.id)} className="ml-1 hover:text-content">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/50 dark:border-primary-800/30">
        <Users className="h-4 w-4 text-primary-600" />
        <span className="text-sm text-content-secondary">
          Estimated reach: <strong className="text-primary-700 dark:text-primary-400">{estimatedLearners}</strong> learner(s)
        </span>
      </div>
    </div>
  );
}
