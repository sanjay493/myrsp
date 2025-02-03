"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the datepicker CSS

const DelayManager = () => {
  const [delays, setDelays] = useState([]);
  const [newDelay, setNewDelay] = useState({});
  const [updateDelay, setUpdateDelay] = useState({});
  const [deleteId, setDeleteId] = useState("");
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  const fetchDelays = async () => {
    try {
      const response = await fetch("/api/delaysEntry");
      const data = await response.json();
      setDelays(data.data);
    } catch (error) {
      console.error("Error fetching delays:", error);
    }
  };

  const addDelay = async () => {
    try {
      // Validate fields before sending the request
      if (!newDelay.rpt_date || !newDelay.unit || !newDelay.remark) {
        console.error("All fields (rpt_date, unit, remark) are required.");
        return alert("Please fill in all the fields before submitting.");
      }

      // Send the POST request
      const response = await fetch("/api/delaysEntry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDelay),
      });

      
      if (!response.ok) {
        console.error(`Request failed with status ${response.status}`);
        throw new Error(`Server responded with status ${response.status}`);
      }
      // Parse the response
      const result = await response.json();

      // Handle success or failure
      if (result.success) {
        console.log("Record added successfully:", result.data);
        fetchDelays(); // Refresh the list of delays
        setNewDelay({ rpt_date: "", unit: "", remark: "" }); // Clear the form
      } else {
        console.error("Failed to add record:", result.message);
        alert(`Failed to add record: ${result.message}`);
      }
    } catch (error) {
      console.error("Error adding delay:", error);
      alert("An error occurred while adding the record. Please try again.");
    }
  };

  const updateDelayRecord = async () => {
    console.log("Payload before sending:", updateDelay); // Debug payload

    try {
      const response = await fetch("/api/delaysEntry", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateDelay),
      });

      if (!response.ok) {
        console.error(`Request failed with status ${response.status}`);
        throw new Error(`Server responded with status ${response.status}`);
      }

      const result = await response.json();
      //console.log("Server response:", result); // Debug response

      if (result.success) {
        fetchDelays(); // Reload data
        setShowUpdatePopup(false); // Close popup
      } else {
        console.error("Update failed:", result.message || "No message provided");
      }
    } catch (error) {
      console.error("Error updating delay:", error);
    }
  };

  const deleteDelay = async (id) => {
    try {
      const response = await fetch("/api/delaysEntry", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id }),
      });

      const result = await response.json();
      if (result.success) {
        fetchDelays(); // Refresh the data after successful deletion
      } else {
        console.error("Delete failed:", result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting delay:", error);
    }
  };

  const openUpdatePopup = (delay) => {
    setUpdateDelay(delay);
    setShowUpdatePopup(true);
  };

  const closeUpdatePopup = () => {
    setShowUpdatePopup(false);
  };

  useEffect(() => {
    fetchDelays();
  }, []);

  // Arrow function to format dates
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  // console.log(updateDelay); // Add this to verify the data being sent

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Datewise Issues Record</h1>

      {/* Centered Add Record Form */}
      <div className="max-w-lg mx-auto mb-8 p-6 border rounded-lg shadow-lg bg-white">
        <h2 className="text-xl mb-4">Add Record</h2>

        {/* Report Date Field with Date Picker */}
        <div className="mb-4">
          <DatePicker
            selected={newDelay.rpt_date ? new Date(newDelay.rpt_date) : null}
            onChange={(date) =>
              setNewDelay({
                ...newDelay,
                rpt_date: date ? date.toISOString() : null,
              })
            }
            dateFormat="dd-MM-yyyy"
            placeholderText="Select Report Date"
            className="border p-2 rounded w-full"
            isClearable
          />
        </div>

        {/* Unit Field */}
        {/* <div className="mb-4">
          <input
            type="text"
            placeholder="Unit"
            name="unit"
            value={newDelay.unit || ""}
            onChange={(e) => setNewDelay({ ...newDelay, [e.target.name]: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div> */}
        <div className="mb-4">
  <select
    name="unit"
    value={newDelay.unit || ""}
    onChange={(e) => setNewDelay({ ...newDelay, [e.target.name]: e.target.value })}
    className="border p-2 rounded w-full"
  >
    <option value="" disabled>Select Unit</option>
    {[ "BF-1", "BF-5", "BPTG","COB-6","COB-1#5","HSM-2","NPM","PM","SMS-1", "SMS-1 caster-1","SMS-1 Converter-P","SMS-1 Converter-Q","SMS-2","SMS-2 Caster-1","SMS-2 Caster-2","SMS-2 Caster-3","SMS-2 Converter A","SMS-2 Converter B","SMS-2 Converter C","SP-1","SP-2","SP-3","STG-1","STG-2"].map((unit) => (
      <option key={unit} value={unit}>
        {unit}
      </option>
    ))}
  </select>
</div>


        {/* Remark Field */}
        <div className="mb-4">
          <textarea
            placeholder="Remark"
            name="remark"
            value={newDelay.remark || ""}
            onChange={(e) => setNewDelay({ ...newDelay, [e.target.name]: e.target.value })}
            className="border p-2 rounded w-full"
          ></textarea>
        </div>

        {/* Add Button */}
        <div className="flex justify-center">
          <button
            onClick={addDelay}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>
      </div>

      {/* Last 50 Records Table */}
      <h2 className="text-xl mb-4">Last 50 Records</h2>
      <div className="overflow-auto">
        <table className="table-auto w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2">Report Date</th>
              <th className="border border-gray-400 px-4 py-2">Unit</th>
              <th className="border border-gray-400 px-4 py-2">Remarks</th>
              <th className="border border-gray-400 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const groupedData = delays.reduce((acc, delay) => {
                if (!acc[delay.rpt_date]) acc[delay.rpt_date] = [];
                acc[delay.rpt_date].push(delay);
                return acc;
              }, {});

              return Object.entries(groupedData).map(([rpt_date, items]) => (
                items.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-100">
                    {/* Merge cell for rpt_date on the first occurrence */}
                    {index === 0 && (
                      <td
                        className="border border-gray-300 px-4 py-2 text-center align-middle"
                        rowSpan={items.length}
                      >
                        {formatDate(rpt_date)}
                      </td>
                    )}
                    <td className="border border-gray-400 px-4 py-2 text-center">{item.unit}</td>
                    <td className="border border-gray-400 px-4 py-2 break-words">{item.remark}</td>
                    <td className="border border-gray-400 px-4 py-2 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          onClick={() => openUpdatePopup(item)}
                        >
                          Update
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          onClick={() => deleteDelay(item._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Update Popup */}
      {showUpdatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl mb-4">Update Record</h2>

            {/* Hidden and Disabled ID Field */}
            <input
              type="hidden"
              value={updateDelay._id}
              readOnly
              disabled
              className="border p-2 rounded w-full mb-4"
            />

            {/* Report Date Field with Date Picker */}
            <div className="mb-4">
              <DatePicker
                selected={updateDelay.rpt_date ? new Date(updateDelay.rpt_date) : null}
                onChange={(date) => setUpdateDelay({ ...updateDelay, rpt_date: date ? date.toISOString() : null })}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select Report Date"
                className="border p-2 rounded w-full"
                isClearable
              />
            </div>

            {/* Unit Field */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Unit"
                name="unit"
                value={updateDelay.unit || ""}
                onChange={(e) => setUpdateDelay({ ...updateDelay, [e.target.name]: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>

            {/* Remark Field */}
            <div className="mb-4">
              <textarea
                placeholder="Remark"
                name="remark"
                value={updateDelay.remark || ""}
                onChange={(e) => setUpdateDelay({ ...updateDelay, [e.target.name]: e.target.value })}
                className="border p-2 rounded w-full"
              ></textarea>
            </div>

            {/* Update Button */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={updateDelayRecord}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Update
              </button>
              <button
                onClick={closeUpdatePopup}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelayManager;
