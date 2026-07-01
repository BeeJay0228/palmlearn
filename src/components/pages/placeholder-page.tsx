import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Construction className="h-16 w-16 text-content-tertiary mb-6" />
      <h1 className="text-2xl font-bold text-content mb-2">{title}</h1>
      <p className="text-sm text-content-secondary max-w-md">
        {description || "This section is coming soon. Check back later for updates."}
      </p>
    </div>
  );
}
