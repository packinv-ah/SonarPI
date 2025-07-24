import { useState } from "react";
import ScheduleList from "../../InspectionPages/ScheduleList";

function InspFabricationScheduleList(props) {
  const [FabricationType, setFabricationType] = useState("Fabrication");
  return (
    <>
      <ScheduleList Type={FabricationType} />
    </>
  );
}

export default InspFabricationScheduleList;
