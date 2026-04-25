import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempDir = path.join(process.cwd(), 'tmp');
    await mkdir(tempDir, { recursive: true });
    
    const filePath = path.join(tempDir, `${Date.now()}_${file.name}`);
    await writeFile(filePath, buffer);

    // Call the Python script for actual transcription
    return new Promise((resolve) => {
      exec(`python3 src/lib/transcribe_file.py "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          resolve(NextResponse.json({ error: 'Transcription failed' }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ text: stdout.trim() }));
      });
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
