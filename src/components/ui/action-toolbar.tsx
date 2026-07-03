"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Separator } from "./separator";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Archive,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  Eye,
  Settings2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface ActionItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary" | "danger" | "success";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
}

interface BulkAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}

interface ActionToolbarProps {
  primaryAction?: ActionItem;
  actions?: ActionItem[];
  bulkActions?: BulkAction[];
  selectedCount?: number;
  className?: string;
  title?: string;
  description?: string;
}

export function ActionToolbar({
  primaryAction,
  actions = [],
  bulkActions = [],
  selectedCount = 0,
  className,
  title,
  description,
}: ActionToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
        className,
      )}
    >
      {selectedCount > 0 ? (
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/30">
            <CheckCircle2 className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {selectedCount} selected
            </span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {bulkActions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant === "danger" ? "danger" : "secondary"}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon && <action.icon className="h-3.5 w-3.5" />}
                {action.label}
              </Button>
            ))}
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => {}}
              className="text-content-tertiary"
            >
              Clear selection
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          {title && (
            <p className="text-sm font-medium text-content">{title}</p>
          )}
          {description && (
            <p className="text-xs text-content-tertiary">{description}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {actions.map((action, idx) => {
          if (action.label === "More") {
            return (
              <DropdownMenu key={idx}>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(actions.filter(a => a.label !== "More")).map((a, i) => (
                    <DropdownMenuItem key={i} onClick={a.onClick} disabled={a.disabled}>
                      {a.icon && <a.icon className="h-4 w-4 mr-2" />}
                      {a.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          return null;
        })}
        {primaryAction && (
          <Button
            variant={primaryAction.variant || "primary"}
            size="md"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            loading={primaryAction.loading}
            asChild={!!primaryAction.href}
          >
            {primaryAction.href ? (
              <a href={primaryAction.href}>
                {primaryAction.icon ? <primaryAction.icon className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {primaryAction.label}
              </a>
            ) : (
              <>
                {primaryAction.icon ? <primaryAction.icon className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {primaryAction.label}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
