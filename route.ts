import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Replace with your actual Unsplash Access Key, or preferably use an environment variable.
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "YOUR_UNSPLASH_ACCESS_KEY"; 

    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20`, {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });

        const data = await res.json();
        return NextResponse.json({ results: data.results });
    } catch (error) {
        console.error("Unsplash API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch from Unsplash' }, { status: 500 });
    }
}