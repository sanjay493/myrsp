import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId utility

const dbName = "rspdesk";
const collectionName = "mthly_production";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Fetch the last 50 records sorted by `rpt_date`
    const data = await db.collection(collectionName).find({mth: {$gte:"202404"}}).toArray();
    //console.log("API Response Data:", data);
    const formattedData = data.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));
    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}