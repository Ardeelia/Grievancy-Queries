import { NextResponse } from 'next/server';
import { saveGrievance } from '@/lib/data-manager';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real app, we'd get the user from Clerk auth()
    // For the demo, we use the username passed from the client
    saveGrievance({
      State_ID: data.state || 'MH',
      District_ID: data.district || 'Pune',
      Village_ID: data.village || 'Demo Village',
      Type: data.type || 'Grievance',
      Description: data.description || 'No description provided',
      Requestor_Details: data.requestor || 'Demo User',
      Raised_By: data.raisedBy || 'anonymous'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save grievance' }, { status: 500 });
  }
}
