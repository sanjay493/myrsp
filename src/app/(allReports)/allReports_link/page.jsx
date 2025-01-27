import Link from 'next/link'
import React from 'react'

const AllReports = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-8">All Reports</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
      <Link href="/" className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
       Yearly Production with Capacity Utilization
      </Link>
      {/* <Link href="/mthProductionManager" className="block text-center bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
          Monthly Production
        
      </Link>
      <Link href="/yrlyProductionManager" className="block text-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-4 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
          Yearly Production
        
      </Link> */}
    </div>
  </div>
  )
}

export default AllReports
