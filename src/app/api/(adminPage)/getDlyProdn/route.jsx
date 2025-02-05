import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId utility

const dbName = "rspdesk";
const collectionName = "dly_prodn";
const monthlyCollection = "mthly_production";






export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Parse and validate the request body
    const body = await request.json();
    // console.log('Received Body:', body);

    // Handle array structure in body
    const record = Array.isArray(body) ? body[0] : body; // Extract the first object if the body is an array

    // Validation: Ensure `rpt_date` and `units` fields are provided and properly structured
    const { rpt_date, units } = record;
    if (!rpt_date || !Array.isArray(units)) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields: `rpt_date` or `units`' },
        { status: 400 }
      );
    }

    // Construct the document to insert
    const newRecord = {
      rpt_date,
      units: units.map((unit) => {
        const { name, ...rest } = unit;
        if (!name) {
          throw new Error(`Each unit must have a valid 'name' field.`);
        }
        return { name, ...rest };
      }),
    };

    console.log('New Record to Insert:', newRecord);

    // Insert the record into the collection
    const result = await db.collection(collectionName).insertOne(newRecord);

    const date = new Date(rpt_date);
    const year = date.getFullYear();
    const month = date.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const format = (date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

let cur_mth_prodn1 = [];
//by using mrate
cur_mth_prodn1 = await db.collection(collectionName).aggregate([
  {
    $match: {
      rpt_date: rpt_date, // Optional: filter for a specific date
    },
  },
  {
    $unwind: "$units", // Flatten the 'units' array
  },
  {
    $addFields: {
      mth: {
        $dateToString: { format: "%Y%m", date: { $dateFromString: { dateString: "$rpt_date" } } },
      },
      unit: "$units.name",
      prodn: { $round: ["$units.mrate", 0] }
    },
  },
  {
    $project: {
      _id: 0, // Exclude _id
      mth: 1,
      unit: 1,
      prodn: 1,
    },
  },
  {
    $match: { prodn: { $exists: true, $ne: null }, unit: { $nin: ["Eq_COBPushg", "BF-Shop"] } } 
  },
  {
    $sort: { mth: 1, unit: 1 }, // Sort by month and unit
  },
]).toArray();

console.log("Monthly Production1:", cur_mth_prodn1);

for (const doc of cur_mth_prodn1) {
  const { mth, unit, prodn } = doc;
  const updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);

  const oldData = await db.collection(monthlyCollection).findOne({ mth, unit });
  // console.log();

  const updateResult = await db.collection(monthlyCollection).updateOne(
    { mth, unit },
    { $set: { prodn, updatedAt } },
    { upsert: true }
  );

  const updatedData = await db.collection(monthlyCollection).findOne({ mth, unit });
   console.log("Old Data:", oldData,"Updated Data:", updatedData);
}

    // Respond with success and inserted ID
    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error('Error inserting data:', error.message);
    return NextResponse.json(
      { error: 'Failed to insert data', details: error.message },
      { status: 500 }
    );
  }
}



