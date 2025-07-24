import { useState } from "react";
import ScheduleList from "../../InspectionPages/ScheduleList";

// InspProfileScheduleList renders the ScheduleList component for Profile type
function InspProfileScheduleList() {
  const [ProfileType, setProfileType] = useState("Profile");
  return (
    <>
      <ScheduleList Type={ProfileType} />
    </>
  );
}

export default InspProfileScheduleList;
