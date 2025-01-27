import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId utility

const dbName = "rspdesk";
const collectionName = "dly_prodn";


export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Fetch the most recent record sorted by `rpt_date`
    const data = await db
      .collection(collectionName)
      .find({})
      .toArray();

    // Format the data (convert `_id` to string)
    const formattedData = data.map((item) => ({
      ...item,
      _id: item._id.toString(),
    
    }));


    // const formattedData = data.map((item) => {
    //   return item.units.map((unit) => ({
    //     rpt_date: item.rpt_date,
    //     unit: unit.name,
    //     ondt_prodn: unit.ondt_prodn
    //   }));
    // }).flat();

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
      console.log("Request Body:", body);
  
      const { rpt_date } = body;
  
      // Validation: Ensure required fields are provided
      if (!rpt_date) {
        return NextResponse.json(
          { success: false, error: "Missing required field: rpt_date" },
          { status: 400 }
        );
      }
  
      // Build the query filter based on rpt_date only
      const filter = { rpt_date };
  
      // Fetch data filtered only by `rpt_date`
      const data = await db
        .collection(collectionName)
        .find(filter)
        .toArray();
  
      if (data.length === 0) {
        return NextResponse.json(
          { success: true, message: "No data found for the given rpt_date", data: [] }
        );
      }
  
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
