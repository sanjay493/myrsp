import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const { initialDate, finalDate, unit } = requestBody || {};

    // Default dates: Today and 7 days before
    const now = new Date();
    const defaultFinalDate = new Date(now);
    defaultFinalDate.setDate(now.getDate() - 1); // Yesterday
    const defaultInitialDate = new Date(now);
    defaultInitialDate.setDate(now.getDate() - 30); // 8 days before
    const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(now.getDate() - 60);

    // Parse or use default dates
    const selectedInitialDate = initialDate
      ? new Date(initialDate)
      : defaultInitialDate;
    const selectedFinalDate = finalDate
      ? new Date(finalDate)
      : defaultFinalDate;

      console.log(initialDate,finalDate)
      console.log(unit)
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("rspdesk");

    // Query determination
    let query = {};
    if (unit) {
      query = { unit: unit,rpt_date: {
        $gte: thirtyDaysAgo, // Last 30 days only
        $lte: now,           // Up to the current date
      }, 

      }; // Query based on unit
    } else {
      query = {
        rpt_date: {
          $gte: selectedInitialDate, 
          $lte: selectedFinalDate,
        },
      }; // Query based on date range
    }

    // Fetch data from MongoDB
    const collection = db.collection("delay");
    const data = await collection.find(query).toArray();

    // Return the response
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
