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
  Session_ID: string;
}

export function getGrievances(): Grievance[] {
  if (!fs.existsSync(CSV_PATH)) return [];
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const g: any = {};
    headers.forEach((header, index) => {
      // Handle the case where a row might not have all columns yet
      g[header] = values[index] || "";
    });
    return g as Grievance;
  });
}

export function saveGrievance(data: Partial<Grievance>) {
  const grievances = getGrievances();
  const nextId = (grievances.length + 1).toString().padStart(3, '0');
  const date = new Date().toLocaleDateString('en-GB');

  const newRow = [
    nextId,
    data.State_ID || 'MH',
    data.District_ID || 'Pune',
    data.Village_ID || 'Demo Village',
    date,
    data.Type || 'Grievance',
    data.Description || '',
    data.Requestor_Details || '',
    data.Raised_By || '',
    data.Session_ID || ''
  ].join(',');

  fs.appendFileSync(CSV_PATH, `\n${newRow}`);
}
