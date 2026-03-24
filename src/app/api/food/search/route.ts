import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('query');
    const pageSize = searchParams.get('pageSize') || '5';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      console.error('USDA_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Food search service is not configured' },
        { status: 500 }
      );
    }

    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=${pageSize}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('USDA API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to search foods' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      foods: data.foods || [],
      totalHits: data.totalHits || 0,
    });
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json(
      { error: 'Failed to search foods' },
      { status: 500 }
    );
  }
}
