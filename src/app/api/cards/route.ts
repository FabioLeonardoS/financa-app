import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, brand, limit, availableLimit, userId, lastFourDigits, closingDay, dueDay, color } = body;

    // Validate required fields
    if (!name || !brand || limit === undefined || availableLimit === undefined || !userId) {
      return NextResponse.json(
        { error: "Missing required fields (name, brand, limit, availableLimit, userId)" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const card = await prisma.creditCard.create({
      data: {
        name,
        brand,
        limit: parseFloat(limit),
        availableLimit: parseFloat(availableLimit),
        userId,
        lastFourDigits: lastFourDigits || null,
        closingDay: closingDay ? parseInt(closingDay, 10) : null,
        dueDay: dueDay ? parseInt(dueDay, 10) : null,
        color: color || null,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating credit card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
