import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const fdcId = searchParams.get('fdcId');

    if (!fdcId) {
      return NextResponse.json(
        { error: 'fdcId parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      console.error('USDA_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Food data service is not configured' },
        { status: 500 }
      );
    }

    const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('USDA API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch food data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Food compounds error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food compounds' },
      { status: 500 }
    );
  }
}
