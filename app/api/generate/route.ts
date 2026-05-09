import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt');
    const model = searchParams.get('model') || 'flux';
    const width = searchParams.get('width') || '1024';
    const height = searchParams.get('height') || '1024';
    const seed = searchParams.get('seed') || Math.floor(Math.random() * 9999999).toString();
    const negative = searchParams.get('negative');

    if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = "sk_gFCfGhLezYoC5F2pEg4h5gpgFn4DhyQj";

    let url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=${model}&width=${width}&height=${height}&seed=${seed}&nologo=true&key=${apiKey}`;
    if (negative) {
        url += `&negative=${encodeURIComponent(negative)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
             return NextResponse.json({ error: 'Failed to fetch image from Pollinations API' }, { status: response.status });
        }
        const arrayBuffer = await response.arrayBuffer();
        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
