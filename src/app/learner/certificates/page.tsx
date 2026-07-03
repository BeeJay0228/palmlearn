"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Award, Download, ExternalLink, ShieldCheck, CalendarDays } from "lucide-react";

const certificates: {
  id: string;
  title: string;
  programme: string;
  issueDate: string;
  verificationCode: string;
  issuer: string;
}[] = [];

export default function LearnerCertificatesPage() {
  if (certificates.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Certificates"
          description="View and download your earned certificates and credentials."
        />
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete training programmes and courses to earn certificates. They will appear here automatically."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Certificates"
        description="View and download your earned certificates and credentials."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert) => (
          <Card key={cert.id} variant="elevated" padding="none" className="overflow-hidden group">
            <div className="relative h-40 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center">
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
              <div className="flex flex-col items-center gap-2">
                <Award className="h-10 w-10 text-white/80" />
                <p className="text-sm font-semibold text-white/90 text-center px-4 line-clamp-2">
                  {cert.title}
                </p>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="glass" size="sm">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-content">{cert.programme}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-content-tertiary">
                <CalendarDays className="h-3 w-3" />
                Issued {new Date(cert.issueDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button className="flex items-center gap-1 text-xs font-medium text-content-secondary hover:text-content transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> Verify
                </button>
              </div>
              <p className="text-[10px] text-content-tertiary/60 mt-2 font-mono">
                {cert.verificationCode}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
