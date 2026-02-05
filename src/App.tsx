import { useState } from 'react'
import { Map } from "@/components/ui/map";

function BasicMapExample() {
  return (
    <div className="h-[400px] w-full">
      <Map center={[-74.006, 40.7128]} zoom={12} />
    </div>
  );
}

  
export default BasicMapExample
