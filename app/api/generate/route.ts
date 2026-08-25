import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
        { error: 'Generator temporarily disabled for security maintenance' },
        { status: 503 }
    );
}
