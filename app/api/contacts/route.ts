import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createContactSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
});

/**
 * GET /api/contacts - List all contacts with search/filter
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({ contacts, total, limit, offset });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts - Create a new contact
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const data = createContactSchema.parse(body);

    // Check for duplicate phone number or email
    if (data.phoneNumber) {
      const existing = await prisma.contact.findUnique({
        where: { phoneNumber: data.phoneNumber },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Contact with this phone number already exists" },
          { status: 409 }
        );
      }
    }

    const contact = await prisma.contact.create({
      data: {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        email: data.email || null,
        company: data.company || null,
      },
    });

    return NextResponse.json(contact);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create contact" },
      { status: 500 }
    );
  }
}
