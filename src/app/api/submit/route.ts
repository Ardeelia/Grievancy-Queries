import { NextResponse } from 'next/server';
import { getGrievances, saveGrievance } from '@/lib/data-manager';
import { exec } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { auth, currentUser } from '@clerk/nextjs/server';

const DATABRICKS_ENDPOINT = process.env.DATABRICKS_ENDPOINT || 'https://your-databricks-instance.com/api/2.0/serving-endpoints/your-endpoint/invocations';
const DATABRICKS_TOKEN = process.env.DATABRICKS_TOKEN || 'dapi_placeholder_token';

export async function POST(request: Request) {
  try {
    // 1. Get Clerk Session Details
    const { userId } = await auth();
    const user = await currentUser();
    const role = (user?.publicMetadata?.role as string) || 'villager';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as string;
    const username = formData.get('username') as string;
    const sessionId = formData.get('sessionId') as string;
    const context = formData.get('context') as string;
    
    if (!file) return NextResponse.json({ error: 'No audio' }, { status: 400 });

    // Save locally for transcription fallback and logging
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = path.join(process.cwd(), 'tmp');
    await mkdir(tempDir, { recursive: true });
    const filePath = path.join(tempDir, `${Date.now()}_${file.name}`);
    await writeFile(filePath, buffer);
    const wavPath = filePath.replace('.webm', '.wav');

    // Internal Transcription for local CSV logging
    const transcription = await new Promise<string>((resolve) => {
      exec(`ffmpeg -i "${filePath}" -ar 16000 -ac 1 "${wavPath}"`, (err) => {
        if (err) resolve("");
        exec(`python3 src/lib/transcribe_file.py "${wavPath}"`, (error, stdout) => {
          resolve(error ? "" : stdout.trim());
        });
      });
    });

    // 2. Call Databricks API as per requirements
    // Note: We use the local transcription if needed, or send the raw audio file to Databricks
    try {
      const databricksResponse = await fetch(DATABRICKS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DATABRICKS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Clerk-User-Id': userId,
          'X-User-Role': role,
        },
        body: JSON.stringify({
          inputs: [{
            audio_base64: buffer.toString('base64'),
            context: context,
            user_id: userId,
            role: role
          }]
        })
      });

      const dbData = await databricksResponse.json();
      
      // If Databricks has specific instructions for follow-up
      if (dbData.status === 'needs_followup') {
        return NextResponse.json({
          status: 'needs_followup',
          native_question: dbData.native_question || "Could you provide more details about this?"
        });
      }
    } catch (err) {
      console.warn("Databricks connection failed, falling back to local processing.");
    }

    // 3. Local Fallback / Record Keeping
    const grievances = getGrievances();
    const userGrievances = grievances.filter(g => g.Raised_By === username);
    const effectiveMode = (mode === 'pause' && userGrievances.length === 0) ? 'new' : mode;

    if (effectiveMode === 'pause' && userGrievances.length > 0) {
      const lastGrievance = userGrievances[userGrievances.length - 1];
      const updatedDescription = `${lastGrievance.Description}; ${transcription}`;
      
      const allGrievances = getGrievances();
      const idx = allGrievances.findIndex(g => g.Case_ID === lastGrievance.Case_ID);
      if (idx !== -1) {
        allGrievances[idx].Description = updatedDescription;
        const headers = "Case_ID,State_ID,District_ID,Village_ID,Date,Type,Description,Requestor_Details,Raised_By,Session_ID";
        const rows = allGrievances.map(g => [
          g.Case_ID, g.State_ID, g.District_ID, g.Village_ID, g.Date, g.Type, g.Description, g.Requestor_Details, g.Raised_By, g.Session_ID || ''
        ].join(','));
        const fs = require('fs');
        fs.writeFileSync('/Users/pulkitjindal/Downloads/Cases-Table.csv', headers + '\n' + rows.join('\n'));
      }
    } else {
      saveGrievance({
        State_ID: 'MH',
        District_ID: 'Pune',
        Village_ID: 'Demo Village',
        Type: 'Grievance',
        Description: transcription,
        Requestor_Details: username,
        Raised_By: username,
        Session_ID: sessionId
      });
    }

    const updated = getGrievances();
    return NextResponse.json({ 
      status: 'success',
      success: true, 
      text: transcription, 
      grievances: updated 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
