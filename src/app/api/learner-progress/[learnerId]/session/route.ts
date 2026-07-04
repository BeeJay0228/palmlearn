import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ learnerId: string }> }
) {
  const { learnerId } = await params;
  const body = await request.json();
  const { action, courseId, lessonId, moduleId, progressBefore, progressAfter } = body;

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  if (action === "start") {
    const session = await prisma.learningSession.create({
      data: {
        id: `sess_${learnerId}_${Date.now()}`,
        learnerId,
        courseId,
        lessonId: lessonId || null,
        moduleId: moduleId || null,
        startTime: new Date(),
        duration: 0,
        progressBefore: progressBefore ?? 0,
        progressAfter: progressAfter ?? 0,
      },
    });
    return NextResponse.json({ session });
  }

  if (action === "end") {
    const { sessionId, duration } = body;
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required for end action" }, { status: 400 });
    }
    const session = await prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        duration: duration ?? 0,
        progressAfter: progressAfter ?? 0,
      },
    });
    return NextResponse.json({ session });
  }

  return NextResponse.json({ error: "action must be 'start' or 'end'" }, { status: 400 });
}
