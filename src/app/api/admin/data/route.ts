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

async function getAuthAdminId(): Promise<string | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("palmlearn-auth");
  if (!authCookie?.value) return null;
  const decoded = decodeAuthCookie(authCookie.value);
  if (!decoded || decoded.role !== "admin") return null;
  return decoded.id;
}

const ALLOWED_FIELDS = [
  "profile",
  "settings",
  "dashboardState",
  "savedFilters",
  "searchPrefs",
  "userManagement",
  "courseManagement",
  "programmeManagement",
  "assignmentManagement",
  "recentRecords",
  "workflowState",
];

export async function GET() {
  const adminId = await getAuthAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await prisma.adminData.findUnique({
    where: { adminId },
  });

  if (!record) {
    return NextResponse.json({});
  }

  const result: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if ((record as Record<string, unknown>)[field] !== undefined) {
      result[field] = (record as Record<string, unknown>)[field];
    }
  }

  return NextResponse.json(result);
}

export async function PATCH(request: NextRequest) {
  const adminId = await getAuthAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const data: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const existing = await prisma.adminData.findUnique({
    where: { adminId },
  });

  if (!existing) {
    await prisma.adminData.create({
      data: { adminId, ...data } as Parameters<typeof prisma.adminData.create>[0]["data"],
    });
  } else {
    await prisma.adminData.update({
      where: { adminId },
      data,
    });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const adminId = await getAuthAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const data: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  await prisma.adminData.upsert({
    where: { adminId },
    create: { adminId, ...data } as Parameters<typeof prisma.adminData.create>[0]["data"],
    update: data,
  });

  return NextResponse.json({ success: true });
}
