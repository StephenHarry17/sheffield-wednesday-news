import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    const response = { status: 'success', databaseUrl: process.env.DATABASE_URL, error: null };
    try {
        // Attempt to connect to the database
        await prisma.$connect();
    } catch (error) {
        response.status = 'error';
        response.error = error.message;
    } finally {
        // Always disconnect the Prisma client after usage
        await prisma.$disconnect();
    }
    return NextResponse.json(response);
}