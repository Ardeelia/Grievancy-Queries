import { NextResponse } from 'next/server';
import { getGrievances, saveGrievance } from '@/lib/data-manager';
import { exec } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const CSV_PATH = '/Users/pulkitjindal/Downloads/Cases-Table.csv';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as string; // 'pause' or 'new'
    const username = formData.get('username') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }

    // 1. Save and Transcribe the audio
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = path.join(process.cwd(), 'tmp');
    await mkdir(tempDir, { recursive: true });
    const filePath = path.join(tempDir, `${Date.now()}_${file.name}`);
    await writeFile(filePath, buffer);

    const wavPath = filePath.replace('.webm', '.wav');
    
    const transcription = await new Promise<string>((resolve) => {
      // Convert to wav first using ffmpeg
      exec(`ffmpeg -i "${filePath}" -ar 16000 -ac 1 "${wavPath}"`, (err) => {
        if (err) {
          console.error("FFmpeg error:", err);
          resolve("");
          return;
        }
        exec(`python3 src/lib/transcribe_file.py "${wavPath}"`, (error, stdout) => {
          if (error) resolve("");
          resolve(stdout.trim());
        });
      });
    });

    if (!transcription) {
      return NextResponse.json({ error: 'Could not transcribe audio' }, { status: 400 });
    }

    // 2. Handle Logic based on Mode
    const grievances = getGrievances();
    
    if (mode === 'pause') {
      // Find the last grievance by this user and append with semicolon
      const userGrievances = grievances.filter(g => g.Raised_By === username);
      if (userGrievances.length === 0) {
        return NextResponse.json({ error: 'No existing grievance to pause' }, { status: 400 });
      }
      
      const lastGrievance = userGrievances[userGrievances.length - 1];
      const updatedDescription = `${lastGrievance.Description}; ${transcription}`;
      
      // Update the CSV (This is a bit crude but works for the demo)
      const csvContent = fs.readFileSync(CSV_PATH, 'utf-8').split('\n');
      for (let i = 0; i < csvContent.length; i++) {
        if (csvContent[i].startsWith(lastGrievance.Case_ID + ',')) {
          const parts = csvContent[i].split(',');
          parts[6] = updatedDescription; // Description column
          csvContent[i] = parts.join(',');
          break;
        }
      }
      fs.writeFileSync(CSV_PATH, csvContent.join('\n'));
      
      return NextResponse.json({ success: true, text: transcription, updated: true });
    } else {
      // Create a NEW grievance
      saveGrievance({
        State_ID: 'MH',
        District_ID: 'Pune',
        Village_ID: 'Demo Village',
        Type: 'Grievance',
        Description: transcription,
        Requestor_Details: username,
        Raised_By: username
      });
      
      return NextResponse.json({ success: true, text: transcription, updated: false });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
