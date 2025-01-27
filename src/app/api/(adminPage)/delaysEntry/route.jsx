import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId utility

const dbName = "rspdesk";
const collectionName = "delay";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Fetch the last 50 records sorted by `rpt_date`
    const data = await db.collection(collectionName).find({}).sort({ rpt_date: -1 }).toArray();
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

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Parse and validate the request body
    const body = await request.json();
// console.log(body);
    // Validation: Ensure required fields are provided
    const { rpt_date, unit, remark } = body;
    // console.log(rpt_date, unit, remark);
    if (!rpt_date || !unit || !remark) {
      return NextResponse.json(
        { error: "Missing required fields: rpt_date, unit, or remark" },
        { status: 400 }
      );
    }
    
    // Construct the document to insert
   // Convert `rpt_date` to a Date object
   const newRecord = {
    rpt_date: new Date(rpt_date), // Convert to ISODate
    unit,
    remark,
  };
    // Insert the record into the collection
    const result = await db.collection(collectionName).insertOne(newRecord);

    // Respond with success and inserted ID
    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Error inserting data:", error.message);
    return NextResponse.json(
      { error: "Failed to insert data", details: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    const body = await request.json();
    const { _id, rpt_date, ...updateData } = body; // Extract `_id` and `rpt_date`

    // Convert `rpt_date` to a Date object if it exists and is not already a Date
    if (rpt_date) {
      updateData.rpt_date = new Date(rpt_date);
    }

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(_id) }, // Convert string `_id` to ObjectId
      { $set: updateData }
    );
// console.log(updateData);
    return NextResponse.json({ success: result.modifiedCount > 0 });
  } catch (error) {
    console.error("Error updating data:", error.message);
    return NextResponse.json(
      { error: "Failed to update data", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    const body = await request.json();
    const { _id } = body; // Extract `_id` from the request body

    // Convert `_id` to ObjectId before using it in the query
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(_id) });

    return NextResponse.json({ success: result.deletedCount > 0 });
  } catch (error) {
    console.error("Error deleting data:", error.message);
    return NextResponse.json(
      { error: "Failed to delete data", details: error.message },
      { status: 500 }
    );
  }
}

