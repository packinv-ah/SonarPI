import { useState } from "react";
import FindSchedule from "../../InspectionPages/FindSchedule";

// InspServiceFindSchedule renders the FindSchedule component for Service type
function InspServiceFindSchedule() {
  const [ServiceType, setServiceType] = useState("Service");
  return (
    <>
      <FindSchedule Type={ServiceType} />
    </>
  );
}

export default InspServiceFindSchedule;
