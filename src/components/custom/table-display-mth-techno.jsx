// components/DataTable.js
export default function TableDispalyMthTechno({ data }) {

    console.log(data)
    
    // Extract the year and month name from data.mth (e.g., "202410" -> "October 2024")
    const formatDate = (mth1,mth2) => {
      const year1 = mth1.slice(0, 4);
      const month1 = mth1.slice(4, 6);
      const year2 = mth1.slice(0, 4);
      const month2 = mth1.slice(4, 6);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${monthNames[parseInt(month1, 10) - 1]} ${year1} to ${monthNames[parseInt(month2, 10) - 1]} ${year2}`;
    };
  
    return (
      <div className="w-11/12 max-w-6xl mx-auto my-0 overflow-x-auto">
        <table className="w-full border-collapse my-5 text-center text-sm md:text-base">
          <thead>
            <tr><th colSpan="13" className="p-1 bg-gray-200 border text-pretty text-right font-light"></th></tr>
            {/* New Row with a formatted month and year */}
            <tr>
              <th colSpan="8" className="p-3 bg-gray-200 border border-gray-300 text-lg font-semibold">
                Monthly Performance Overview for <span className="text-green-700 font-bold bg-slate-100">  {formatDate(data[0]?.mth)}</span>
              </th>
              <th colSpan="5" className="p-3 bg-gray-200 border border-gray-300 text-lg font-semibold">
                Fiscal Year Summary
              </th>
            </tr>
  
            <tr className="bg-blue-600 text-white">
              <th className="p-3 border border-gray-300">Unit</th>
              <th className="p-3 border border-gray-300">APP</th>
              <th className="p-3 border border-gray-300">OPP</th>
              <th className="p-3 border border-gray-300">Actual</th>
              <th className="p-3 border border-gray-300">%FF (App)</th>
              <th className="p-3 border border-gray-300">%FF (Opp)</th>
              <th className="p-3 border border-gray-300">CPLY</th>
              <th className="p-3 border border-gray-300">Growth (%)</th>
              <th className="p-3 border border-gray-300">FY_APP</th>
              <th className="p-3 border border-gray-300">FY_Actual</th>
              <th className="p-3 border border-gray-300">%FF</th>
              <th className="p-3 border border-gray-300">FY_CPLY</th>
              <th className="p-3 border border-gray-300">FY_Growth (%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="odd:bg-white even:bg-gray-100 hover:bg-gray-200">
                <td className="p-3 border border-gray-300">{item.unit}</td>
                <td className="p-3 border border-gray-300">{item.APP}</td>
                <td className="p-3 border border-gray-300">{item.OPP}</td>
                <td className="p-3 border border-gray-300">{item.Actual.toFixed(0)}</td>
                <td className={`p-3 border border-gray-300 ${parseFloat(item.ffApp) > 90 ? 'text-green-500 font-bold' : ''}`}>
    {parseFloat(item.ffApp).toFixed(0)}%
  </td>
  
                <td className={`p-3 border border-gray-300 ${parseFloat(item.ffOpp) > 90 ? 'text-green-500 font-bold' : ''}`}>
                  {parseFloat(item.ffOpp).toFixed(0)}%
                </td>
                <td className="p-3 border border-gray-300">{item.cply.toFixed(0)}</td>
                <td className="p-3 border border-gray-300">{renderGrowth(item.growth)}</td>
                <td className="p-3 border border-gray-300">{item.FYAPP_total.toFixed(0)}</td>
                <td className="p-3 border border-gray-300">{item.FYActual_total.toFixed(0)}</td>
                <td className={`p-3 border border-gray-300 ${parseFloat(item.FF_FY) > 90 ? 'text-green-500 font-bold' : ''}`}>
                  {parseFloat(item.FF_FY).toFixed(0)}% </td>
                <td className="p-3 border border-gray-300">{item.FY_CPLY_total.toFixed(0)}</td>
                <td className="p-3 border border-gray-300">{renderGrowth(item.FY_Growth)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  