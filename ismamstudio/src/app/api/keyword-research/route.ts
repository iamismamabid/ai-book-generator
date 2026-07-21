import { NextResponse } from "next/server";

export interface CompetingBook {
  id: string;
  title: string;
  authors: string[];
  categories: string[];
  pageCount: number | null;
  averageRating: number | null;
  ratingsCount: number | null;
  publishedDate: string | null;
  thumbnail: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (!apiKey) {
    console.error("Missing Google Books API key in .env.local");
    return NextResponse.json(
      { error: "API key missing. Please add GOOGLE_BOOKS_API_KEY to .env.local and RESTART your server" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&country=US&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google Books API responded with ${response.status}`);
    }

    const data = await response.json();

    const books: CompetingBook[] = (data.items ?? []).map((item: any) => {
      const info = item.volumeInfo ?? {};
      return {
        id: item.id,
        title: info.title ?? "Untitled",
        authors: info.authors ?? [],
        categories: info.categories ?? [],
        pageCount: info.pageCount ?? null,
        averageRating: info.averageRating ?? null,
        ratingsCount: info.ratingsCount ?? null,
        publishedDate: info.publishedDate ?? null,
        thumbnail: info.imageLinks?.thumbnail ?? null,
      };
    });

    // Sort by ratingsCount desc — a rough proxy for which titles have sold/been read the most.
    books.sort((a, b) => (b.ratingsCount ?? 0) - (a.ratingsCount ?? 0));

    return NextResponse.json({
      totalItems: data.totalItems ?? books.length,
      books,
    });
  } catch (error) {
    console.error("Google Books lookup failed:", error);
    return NextResponse.json({ error: "Failed to fetch competing books" }, { status: 500 });
  }
}
