import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ learnerId: string; courseId: string }> }
) {
  const { learnerId, courseId } = await params;

  const enrollment = await prisma.learnerProgress.findUnique({
    where: { learnerId_courseId: { learnerId, courseId } },
  });

  if (!enrollment) {
    return NextResponse.json({ enrollment: null, lessonProgress: [] });
  }

  const lessonProgress = await prisma.lessonProgress.findMany({
    where: { learnerId, courseId },
  });

  return NextResponse.json({ enrollment, lessonProgress });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ learnerId: string; courseId: string }> }
) {
  const { learnerId, courseId } = await params;
  const body = await request.json();

  const now = new Date();
  const createData: Record<string, unknown> = {
    id: `lp_${learnerId}_${courseId}`,
    learnerId,
    courseId,
    assignmentId: body.assignmentId || "",
    progress: body.progress ?? 0,
    status: body.status || "not_started",
    timeSpent: body.timeSpent ?? 0,
    updatedAt: now,
  };
  if (body.campaignId !== undefined) createData.campaignId = body.campaignId || null;
  if (body.firstOpened !== undefined) createData.firstOpened = new Date(body.firstOpened);
  if (body.lastActivity !== undefined) createData.lastActivity = new Date(body.lastActivity);
  else createData.lastActivity = now;
  if (body.completedDate !== undefined) createData.completedDate = body.completedDate ? new Date(body.completedDate) : null;
  if (body.currentModuleId !== undefined) createData.currentModuleId = body.currentModuleId || null;
  if (body.currentLessonId !== undefined) createData.currentLessonId = body.currentLessonId || null;
  if (body.currentLessonProgress !== undefined) createData.currentLessonProgress = body.currentLessonProgress ?? null;

  const updateData: Record<string, unknown> = { updatedAt: now };
  if (body.progress !== undefined) updateData.progress = body.progress;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.timeSpent !== undefined) updateData.timeSpent = body.timeSpent;
  if (body.lastActivity !== undefined) updateData.lastActivity = new Date(body.lastActivity);
  if (body.firstOpened !== undefined) updateData.firstOpened = new Date(body.firstOpened);
  if (body.completedDate !== undefined) updateData.completedDate = body.completedDate ? new Date(body.completedDate) : null;
  if (body.currentModuleId !== undefined) updateData.currentModuleId = body.currentModuleId;
  if (body.currentLessonId !== undefined) updateData.currentLessonId = body.currentLessonId;
  if (body.currentLessonProgress !== undefined) updateData.currentLessonProgress = body.currentLessonProgress;
  if (body.campaignId !== undefined) updateData.campaignId = body.campaignId;

  const enrollment = await prisma.learnerProgress.upsert({
    where: { learnerId_courseId: { learnerId, courseId } },
    create: createData as Parameters<typeof prisma.learnerProgress.create>[0]["data"],
    update: updateData as Parameters<typeof prisma.learnerProgress.update>[0]["data"],
  });

  return NextResponse.json({ enrollment });
}
