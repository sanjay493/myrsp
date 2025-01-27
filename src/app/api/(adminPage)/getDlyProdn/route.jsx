import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId utility

const dbName = "rspdesk";
const collectionName = "dly_prodn";






export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Parse and validate the request body
    const body = await request.json();
    console.log('Received Body:', body);

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
// //by adding daily prodn
//     const cur_mth_prodn = await db.collection(collectionName).aggregate([
//       { $match: { rpt_date: { $gte: format(startDate), $lte: format(endDate) } } },
//       { $unwind: "$units" },
//       {
//         $group: {
//           _id: {  mth: { $dateToString: { format: "%Y%m", date: { $dateFromString: { dateString: "$rpt_date" } } } },
//           unit: "$units.name" },
//           totalProdn: { $sum: "$units.ondt_prodn" },
//           count: {
//             $sum: {
//               $cond: [
//                 { $in: ["$units.name", ["Eq_COBPushg", "COB-1#5Pushg", "COB-6Pushg"]] },
//                 1,
//                 0
//               ]
//             }
//           }
//         }
//       },
//       {
//         $addFields: {
//           prodn: {
//             $cond: [
//               { $in: ["$_id.unit", ["Eq_COBPushg", "COB-1#5Pushg", "COB-6Pushg"]] },
//               { $divide: ["$totalProdn", "$count"] },
//               "$totalProdn"
//             ]
//           }
//         }
//       },
//       { $project: { _id: 0, mth: "$_id.mth", unit: "$_id.unit", prodn: { $round: ["$prodn", 0] },count:"$count" } },
//       { $sort: { mth: 1, unit: 1 } }
//     ]).toArray();
    

//     console.log("Monthly Production:", cur_mth_prodn);
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
      prodn: "$units.mrate",
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
    $match: {
      prodn: { $exists: true, $ne: null }, // Ensure mrate is present
    },
  },
  {
    $sort: { mth: 1, unit: 1 }, // Sort by month and unit
  },
]).toArray();


console.log("Monthly Production1:", cur_mth_prodn1);

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



