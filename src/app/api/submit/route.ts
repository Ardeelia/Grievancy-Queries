import { NextResponse } from 'next/server';
import { getGrievances, saveGrievance } from '@/lib/data-manager';
import { exec } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const CSV_PATH = '/Users/pulkitjindal/Downloads/Cases-Table.csv';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let mode, username, transcription;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      mode = body.mode;
      username = body.username;
      transcription = body.text;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      mode = formData.get('mode') as string;
      username = formData.get('username') as string;
      
      if (!file) return NextResponse.json({ error: 'No audio' }, { status: 400 });

      // Save and transcribe
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const tempDir = path.join(process.cwd(), 'tmp');
      await mkdir(tempDir, { recursive: true });
      const filePath = path.join(tempDir, `${Date.now()}_${file.name}`);
      await writeFile(filePath, buffer);
      const wavPath = filePath.replace('.webm', '.wav');

      transcription = await new Promise<string>((resolve) => {
        exec(`ffmpeg -i "${filePath}" -ar 16000 -ac 1 "${wavPath}"`, (err) => {
          if (err) resolve("");
          exec(`python3 src/lib/transcribe_file.py "${wavPath}"`, (error, stdout) => {
            resolve(error ? "" : stdout.trim());
          });
        });
      });
    }

    if (!transcription) {
      return NextResponse.json({ error: 'No text captured' }, { status: 400 });
    }

    // 2. Handle Logic based on Mode
    const grievances = getGrievances();
    const userGrievances = grievances.filter(g => g.Raised_By === username);
    
    // Auto-switch to 'new' if 'pause' is clicked but no history exists
    const effectiveMode = (mode === 'pause' && userGrievances.length === 0) ? 'new' : mode;

    if (effectiveMode === 'pause') {
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
