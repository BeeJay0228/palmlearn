import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ learnerId: string }> }
) {
  const { learnerId } = await params;

  const inProgress = await prisma.learnerProgress.findMany({
    where: {
      learnerId,
      status: { in: ["in_progress", "not_started"] },
    },
    orderBy: { lastActivity: { sort: "desc", nulls: "last" } },
    take: 10,
  });

  const resumeData = inProgress.map((e) => ({
    id: e.id,
    courseId: e.courseId,
    campaignId: e.campaignId,
    progress: e.progress,
    status: e.status,
    currentModuleId: e.currentModuleId,
    currentLessonId: e.currentLessonId,
    currentLessonProgress: e.currentLessonProgress,
    lastActivity: e.lastActivity,
    timeSpent: e.timeSpent,
  }));

  return NextResponse.json({ resumeItems: resumeData });
}
