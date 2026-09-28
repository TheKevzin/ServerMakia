import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST() {
  return NextResponse.json(
    { error: 'Public registration is disabled. Admin access only.' },
    { status: 403 }
  );
}
