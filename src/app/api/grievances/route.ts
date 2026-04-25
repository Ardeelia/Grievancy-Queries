import { getGrievances } from "@/lib/data-manager";
import { NextResponse } from "next/server";

export async function GET() {
  const grievances = getGrievances();
  return NextResponse.json(grievances);
}
