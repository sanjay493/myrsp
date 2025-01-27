'use client'


import React, { Suspense } from "react";


const MainUnitPerfBlock = React.lazy(() => import("@/components/custom/dashboard/main-unit-perf-block"));
const BfShopSmsChart = React.lazy(() => import("@/components/custom/dashboard/display_graph_hm_cs_ss"));
const ConverterBarChart = React.lazy(() => import("@/components/custom/dashboard/converters_blows"));
const HMChart = React.lazy(() => import("@/components/custom/dashboard/hm"));
const MillChart = React.lazy(() => import("@/components/custom/dashboard/mill"));
const ProductionBarChart = React.lazy(() => import("@/components/custom/dashboard/on_date_barchart"));

export default function Home() {
  return (
    <div className="grid gap-[16px]">
      <div className="justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-center text-gray-800 mt-4">A RSP: Current Month Performance Overview</h1>
      </div> 
      <div className="grid lg:grid-cols-3 gap-[16px]">
      <Suspense fallback={<div>Loading Main Performance...</div>}>
        <ProductionBarChart />
      
        
    

      </Suspense>
      </div>
      <div className="grid xl:grid-cols-2 gap-[16px]">
        <Suspense fallback={<div>Loading BF Shop SMS Chart...</div>}>
          <BfShopSmsChart />
        </Suspense>
        <Suspense fallback={<div>Loading Mill Chart...</div>}>
          <MillChart />
        </Suspense>
        <Suspense fallback={<div>Loading HM Chart...</div>}>
          <HMChart />
        </Suspense>
        <Suspense fallback={<div>Loading Converter Bar Chart...</div>}>
          <ConverterBarChart />
        </Suspense>
      </div>
    </div>
  );
}
