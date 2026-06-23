import { NextResponse } from 'next/server';
import { processBulkToPages } from '@/app/utils/bulkProcessor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bulkText, wordsPerPuzzle = 15, gridSize = 12, textCase = 'uppercase' } = body;

    if (!bulkText || typeof bulkText !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing bulkText parameter' },
        { status: 400 }
      );
    }

    // Process the bulk text into word search pages
    const pagesData = processBulkToPages(bulkText, wordsPerPuzzle, gridSize, textCase);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${pagesData.length} word search puzzle(s)`,
      pages: pagesData
    });

  } catch (error) {
    console.error('Error processing bulk text:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing bulk text' },
      { status: 500 }
    );
  }
}
