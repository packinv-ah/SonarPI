import { useState } from "react";
import FindSchedule from "../../InspectionPages/FindSchedule";

function InspFabricationFindSchedule() {
  const [FabricationPNType, setFabricationPNType] = useState("Fabrication");
  return (
    <>
      <FindSchedule PNType={FabricationPNType} />
    </>
  );
}

export default InspFabricationFindSchedule;
