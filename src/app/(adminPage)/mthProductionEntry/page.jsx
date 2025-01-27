"use client";

import { useState, useEffect } from "react";



const ProdnManager = () => {
  const [Prodn, setProdn] = useState([]);
  const [newProdn, setNewProdn] = useState({});
  const [updateProdn, setUpdateProdn] = useState({});
  const [deleteId, setDeleteId] = useState("");
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  const fetchProdn = async () => {
    try {
      const response = await fetch("/api/mthProductionEntry");
      const data = await response.json();
      setProdn(data.data);
    } catch (error) {
      console.error("Error fetching Prodn:", error);
    }
  };

  const addProdn = async () => {
    try {
      // Validate fields before sending the request
      if (!newProdn.mth || !newProdn.unit || !newProdn.prodn) {
        console.error("All fields (mth, unit, prodn) are required.");
        return alert("Please fill in all the fields before submitting.");
      }

      // Send the POST request
      const response = await fetch("/api/mthProductionEntry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProdn),
      });

      // Parse the response
      const result = await response.json();

      // Handle success or failure
      if (result.success) {
        fetchProdn(); // Refresh the list of Prodn
        setNewProdn({ mth: "", unit: "", prodn: "" }); // Clear the form
      } else {
        console.error("Failed to add record:", result.message);
        alert(`Failed to add record: ${result.message}`);
      }
    } catch (error) {
      console.error("Error adding Prodn:", error);
      alert("An error occurred while adding the record. Please try again.");
    }
  };

  const updateProdnRecord = async () => {
    console.log("Payload before sending:", updateProdn); // Debug payload

    try {
      const response = await fetch("/api/mthProductionEntry", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateProdn),
      });

      if (!response.ok) {
        console.error(`Request failed with status ${response.status}`);
        throw new Error(`Server responded with status ${response.status}`);
      }

      const result = await response.json();
      //console.log("Server response:", result); // Debug response

      if (result.success) {
        fetchProdn(); // Reload data
        setShowUpdatePopup(false); // Close popup
      } else {
        console.error("Update failed:", result.message || "No message provided");
      }
    } catch (error) {
      console.error("Error updating Prodn:", error);
    }
  };

  const deleteProdn = async (id) => {
    try {
      const response = await fetch("/api/mthProductionEntry", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id }),
      });

      const result = await response.json();
      if (result.success) {
        fetchProdn(); // Refresh the data after successful deletion
      } else {
        console.error("Delete failed:", result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting Prodn:", error);
    }
  };

  const openUpdatePopup = (Prodn) => {
    setUpdateProdn(Prodn);
    setShowUpdatePopup(true);
  };

  const closeUpdatePopup = () => {
    setShowUpdatePopup(false);
  };

  useEffect(() => {
    fetchProdn();
  }, []);

  // Arrow function to format dates
  const formatMth = (yyyymm) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = yyyymm.slice(0, 4);
    const month = parseInt(yyyymm.slice(4, 6), 10);
    const shortMonth = monthNames[month - 1];
    const shortYear = year.slice(2);
    return `${shortMonth}'${shortYear}`;
  };

  //console.log(updateProdn); // Add this to verify the data being sent

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Monthly Production Records</h1>

      {/* Centered Add Record Form */}
      <div className="max-w-lg mx-auto mb-8 p-6 border rounded-lg shadow-lg bg-white">
        <h2 className="text-xl mb-4">Add Record</h2>


        {/* Unit Field */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Unit"
            name="unit"
            value={newProdn.unit || ""}
            onChange={(e) => setNewProdn({ ...newProdn, [e.target.name]: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* mth Field */}
        <div className="mb-4">
          <textarea
            placeholder="Month (in yyyymm)"
            name="mth"
            value={newProdn.mth || ""}
            onChange={(e) => setNewProdn({ ...newProdn, [e.target.name]: e.target.value })}
            className="border p-2 rounded w-full"
          ></textarea>
        </div>

        {/* Prodn Field */}
        <div className="mb-4">
          <textarea
            placeholder="Production in T"
            name="prodn"
            value={newProdn.prodn || ""}
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = value ? parseFloat(value) : ""; // Convert to number or empty string
              setNewProdn({
                ...newProdn,
                [e.target.name]: isNaN(numericValue) ? "" : numericValue, // Only set if valid number
              });}}
            className="border p-2 rounded w-full"
          ></textarea>
        </div>

        {/* Add Button */}
        <div className="flex justify-center">
          <button
            onClick={addProdn}
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

              <th className="border border-gray-400 px-4 py-2">Month</th>
              <th className="border border-gray-400 px-4 py-2">Unit</th>
              <th className="border border-gray-400 px-4 py-2">Production</th>
              <th className="border border-gray-400 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const groupedData = Prodn.reduce((acc, Prodn) => {
                if (!acc[Prodn.mth]) acc[Prodn.mth] = [];
                acc[Prodn.mth].push(Prodn);
                return acc;
              }, {});

              return Object.entries(groupedData).map(([mth, items]) => (
                items.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-100">
                    {/* Merge cell for mth on the first occurrence */}
                    {index === 0 && (
                      <td
                        className="border border-gray-300 px-4 py-2 text-center align-middle"
                        rowSpan={items.length}
                      >
                        {formatMth(mth)}
                      </td>
                    )}
                    <td className="border border-gray-400 px-4 py-2 text-center">{item.unit}</td>
                    <td className="border border-gray-400 px-4 py-2 break-words">{item.prodn}</td>
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
                          onClick={() => deleteProdn(item._id)}
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
           value={updateProdn._id}
           readOnly
           disabled
           className="border p-2 rounded w-full mb-4"
         />
     
         {/* Unit Field */}
         <div className="mb-4">
           <input
             type="text"
             placeholder="Unit"
             name="unit"
             value={updateProdn.unit || ""}
             onChange={(e) => setUpdateProdn({ ...updateProdn, [e.target.name]: e.target.value })}
             className="border p-2 rounded w-full"
           />
         </div>
     
         {/* Month Field */}
         <div className="mb-4">
           <textarea
             placeholder="Month (in YYYYMM)"
             name="mth"
             value={updateProdn.mth || ""}
             onChange={(e) => setUpdateProdn({ ...updateProdn, [e.target.name]: e.target.value })}
             className="border p-2 rounded w-full"
           ></textarea>
         </div>
     
         {/* Production Field (with number validation) */}
         <div className="mb-4">
           <textarea
             placeholder="Production in T"
             name="prodn"
             value={updateProdn.prodn || ""}
             onChange={(e) => {
               const value = e.target.value;
               const numericValue = value ? parseFloat(value) : ""; // Convert to number or empty string
               setUpdateProdn({
                 ...updateProdn,
                 [e.target.name]: isNaN(numericValue) ? "" : numericValue, // Only set if valid number
               });
             }}
             className="border p-2 rounded w-full"
           ></textarea>
         </div>
     
         {/* Update Button */}
         <div className="flex justify-center space-x-4">
           <button
             onClick={updateProdnRecord}
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

export default ProdnManager;
