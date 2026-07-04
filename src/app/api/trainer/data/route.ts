import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database";
import { cookies } from "next/headers";

function decodeAuthCookie(cookieValue: string): { role: string; id: string } | null {
  try {
    return JSON.parse(atob(cookieValue)) as { role: string; id: string };
  } catch {
    return null;
  }
}

async function getAuthTrainerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("palmlearn-auth");
  if (!authCookie?.value) return null;
  const decoded = decodeAuthCookie(authCookie.value);
  if (!decoded || decoded.role !== "trainer") return null;
  return decoded.id;
}

export async function GET() {
  const trainerId = await getAuthTrainerId();
  if (!trainerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await prisma.trainerData.findUnique({
    where: { trainerId },
  });

  if (!record) {
    return NextResponse.json({});
  }

  return NextResponse.json({
    profile: record.profile,
    settings: record.settings,
    dashboardState: record.dashboardState,
    savedFilters: record.savedFilters,
    searchPrefs: record.searchPrefs,
    courseProgress: record.courseProgress,
    programmeProgress: record.programmeProgress,
    assignmentProgress: record.assignmentProgress,
    recentContent: record.recentContent,
  });
}

export async function PATCH(request: NextRequest) {
  const trainerId = await getAuthTrainerId();
  if (!trainerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = [
    "profile",
    "settings",
    "dashboardState",
    "savedFilters",
    "searchPrefs",
    "courseProgress",
    "programmeProgress",
    "assignmentProgress",
    "recentContent",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const existing = await prisma.trainerData.findUnique({
    where: { trainerId },
  });

  if (!existing) {
    await prisma.trainerData.create({
      data: { trainerId, ...data } as Parameters<typeof prisma.trainerData.create>[0]["data"],
    });
  } else {
    await prisma.trainerData.update({
      where: { trainerId },
      data,
    });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const trainerId = await getAuthTrainerId();
  if (!trainerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = [
    "profile",
    "settings",
    "dashboardState",
    "savedFilters",
    "searchPrefs",
    "courseProgress",
    "programmeProgress",
    "assignmentProgress",
    "recentContent",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  await prisma.trainerData.upsert({
    where: { trainerId },
    create: { trainerId, ...data } as Parameters<typeof prisma.trainerData.create>[0]["data"],
    update: data,
  });

  return NextResponse.json({ success: true });
}
