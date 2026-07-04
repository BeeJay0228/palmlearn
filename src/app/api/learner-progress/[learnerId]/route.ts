import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ learnerId: string }> }
) {
  const { learnerId } = await params;

  const enrollments = await prisma.learnerProgress.findMany({
    where: { learnerId },
    orderBy: { lastActivity: { sort: "desc", nulls: "last" } },
  });

  const lessonProgress = await prisma.lessonProgress.findMany({
    where: { learnerId },
  });

  return NextResponse.json({ enrollments, lessonProgress });
}
