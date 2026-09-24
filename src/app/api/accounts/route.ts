import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AccountType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bankName, balance, type, userId, color } = body;

    // Validate required fields
    if (!bankName || !type || !userId) {
      return NextResponse.json(
        { error: "Missing required fields (bankName, type, userId)" },
        { status: 400 }
      );
    }

    // Validate type enum
    const validTypes = Object.values(AccountType);
    if (!validTypes.includes(type as AccountType)) {
      return NextResponse.json(
        { error: "Invalid account type" },
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

    const account = await prisma.account.create({
      data: {
        bankName,
        balance: balance ? parseFloat(balance) : 0,
        type: type as AccountType,
        userId,
        color: color || null,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
