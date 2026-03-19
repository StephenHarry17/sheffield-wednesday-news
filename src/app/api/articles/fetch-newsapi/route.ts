import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeArticleCategory } from '@/lib/gemini';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!NEWSAPI_KEY) {
            return NextResponse.json({ error: 'NEWSAPI_KEY not configured' }, { status: 500 });
        }

        const queries = ['Sheffield Wednesday', 'Sheffield Wednesday FC', 'SWFC'];
        let allArticles: any[] = [];

        for (const query of queries) {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=50&apiKey=${NEWSAPI_KEY}`);
            if (!response.ok) continue;
            const data = await response.json();
            if (data.articles) allArticles = allArticles.concat(data.articles);
        }

        const uniqueArticles = Array.from(new Map(allArticles.map(a => [a.url, a])).values());
        return NextResponse.json({ articles: uniqueArticles });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}