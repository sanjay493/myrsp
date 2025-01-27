"use client";
// not completed
import { useState, useEffect } from "react";

const ProdnManager = () => {
  const [prodn, setProdn] = useState([]);
  const [rptDate, setRptDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProdn = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dlyProdn?rpt_date=${rptDate}`);
      const result = await response.json();

      if (result.success) {
        setProdn(result.data);
      } else {
        setError(result.error || "Failed to fetch data.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProdn = async (id) => {
    try {
      const response = await fetch("/api/getDlyProdn", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id }),
      });

      const result = await response.json();
      if (result.success) {
        fetchProdn();
        alert("Record deleted successfully!");
      } else {
        alert(result.error || "Failed to delete record.");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("An error occurred while deleting the record.");
    }
  };

  useEffect(() => {
    if (rptDate) {
      fetchProdn();
    }
  }, [rptDate]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Daily Production Manager</h1>

      <label htmlFor="rptDate" className="block mb-2">
        Report Date:
      </label>
      <input
        type="date"
        id="rptDate"
        value={rptDate}
        onChange={(e) => setRptDate(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {prodn.length > 0 ? (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border p-2">Unit Name</th>
              <th className="border p-2">On-Date Production</th>
              <th className="border p-2">Till-Date Production</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prodn.map((record) => (
              <tr key={record._id}>
                <td className="border p-2">{record.unit_name}</td>
                <td className="border p-2">{record.ondt_prodn}</td>
                <td className="border p-2">{record.tilldt_prodn}</td>
                <td className="border p-2">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteProdn(record._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No records found for the selected date.</p>
      )}
    </div>
  );
};

export default ProdnManager;
