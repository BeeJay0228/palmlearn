import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ learnerId: string }> }
) {
  const { learnerId } = await params;
  const body = await request.json();
  const { courseId, moduleId, lessonId, completed, timeSpent, progress } = body;

  if (!courseId || !moduleId || !lessonId) {
    return NextResponse.json({ error: "courseId, moduleId, and lessonId are required" }, { status: 400 });
  }

  const lesson = await prisma.lessonProgress.upsert({
    where: { learnerId_lessonId: { learnerId, lessonId } },
    create: {
      id: `lp_${learnerId}_${lessonId}`,
      learnerId,
      courseId,
      moduleId,
      lessonId,
      completed: completed ?? false,
      progress: progress ?? (completed ? 100 : 0),
      timeSpent: timeSpent ?? 0,
    },
    update: {
      ...(completed !== undefined && { completed }),
      ...(timeSpent !== undefined && { timeSpent: { increment: timeSpent } }),
      ...(progress !== undefined && { progress }),
      ...(completed === true && { completedAt: new Date() }),
    },
  });

  return NextResponse.json({ lesson });
}
