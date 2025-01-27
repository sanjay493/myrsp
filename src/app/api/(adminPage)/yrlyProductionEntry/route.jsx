import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId utility

const dbName = "rspdesk";
const collectionName = "yearly_production";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Fetch the last 30 records sorted by `rpt_date`
    const data = await db
      .collection(collectionName)
      .find({})
      .sort({ fy_year: -1 })
      .toArray();

    // Format the data (convert `_id` to string)
    const formattedData = data.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
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

    // Validation: Ensure required fields are provided
    const { fy_year, unit, prodn } = body;
    if (!fy_year || !unit || prodn === undefined) { // Check for missing fields
      return NextResponse.json(
        { error: 'Missing required fields: unit, fy_year, or prodn' },
        { status: 400 }
      );
    }

    // Ensure `prodn` is a valid number
    if (isNaN(prodn) || prodn < 0) {
      return NextResponse.json(
        { error: 'Invalid value for prodn. It must be a non-negative number.' },
        { status: 400 }
      );
    }

    // Construct the document to insert
    const newRecord = { fy_year, unit, prodn };

    // Insert the record into the collection
    const result = await db.collection(collectionName).insertOne(newRecord);

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



export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    const body = await request.json();
    const { _id, ...updateData } = body; // Extract `_id`

    // Validation: Ensure `_id` and data to update are provided
    if (!_id || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Missing `_id` or no data to update" },
        { status: 400 }
      );
    }

    // Update the document
    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(_id) }, // Convert string `_id` to ObjectId
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No record updated. Check if `_id` exists." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
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
    const { _id } = body; // Extract `_id`

    // Validation: Ensure `_id` is provided
    if (!_id) {
      return NextResponse.json(
        { error: "Missing `_id` for deletion" },
        { status: 400 }
      );
    }

    // Delete the document
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "No record found to delete. Check if `_id` exists." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting data:", error.message);
    return NextResponse.json(
      { error: "Failed to delete data", details: error.message },
      { status: 500 }
    );
  }
}
