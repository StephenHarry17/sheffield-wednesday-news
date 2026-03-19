import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function GET() {
    const response: { status: string; databaseUrl?: string; error: string | null } = { status: 'success', databaseUrl: process.env.DATABASE_URL, error: null };
    try {
        await prisma.$connect();
    } catch (error) {
        response.status = 'error';
        response.error = error instanceof Error ? error.message : String(error);
    } finally {
        await prisma.$disconnect();
    }
    return NextResponse.json(response);
}