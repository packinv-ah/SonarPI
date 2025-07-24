import { useState } from "react";
import ScheduleList from "../../InspectionPages/ScheduleList";

// Displays the service schedule list using ScheduleList component
function InspServiceScheduleList() {
  const [ServiceType, setServiceType] = useState("Service");
  return (
    <>
      <ScheduleList Type={ServiceType} />
    </>
  );
}

export default InspServiceScheduleList;
