import fs from 'fs';
import path from 'path';

const CSV_PATH = '/Users/pulkitjindal/Downloads/Cases-Table.csv';

export interface Grievance {
  Case_ID: string;
  State_ID: string;
  District_ID: string;
  Village_ID: string;
  Date: string;
  Type: string;
  Description: string;
  Requestor_Details: string;
  Raised_By: string;
}

export function getGrievances(): Grievance[] {
  if (!fs.existsSync(CSV_PATH)) return [];
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      Case_ID: values[0],
      State_ID: values[1],
      District_ID: values[2],
      Village_ID: values[3],
      Date: values[4],
      Type: values[5],
      Description: values[6],
      Requestor_Details: values[7],
      Raised_By: values[8]
    };
  });
}

export function saveGrievance(data: Omit<Grievance, 'Case_ID' | 'Date'>) {
  const grievances = getGrievances();
  const nextId = grievances.length > 0 ? Math.max(...grievances.map(g => parseInt(g.Case_ID))) + 1 : 1001;
  const date = new Date().toISOString().split('T')[0];
  
  const newLine = `\n${nextId},${data.State_ID},${data.District_ID},${data.Village_ID},${date},${data.Type},${data.Description},${data.Requestor_Details},${data.Raised_By}`;
  fs.appendFileSync(CSV_PATH, newLine);
}

export function getUserSubmissionCount(username: string): number {
  const grievances = getGrievances();
  return grievances.filter(g => g.Raised_By === username).length;
}
