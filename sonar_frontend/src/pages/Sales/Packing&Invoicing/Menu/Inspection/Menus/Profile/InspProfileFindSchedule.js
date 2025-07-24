import { useState } from "react";
import FindSchedule from "../../InspectionPages/FindSchedule";

// InspProfileFindSchedule renders the FindSchedule component for Profile type
function InspProfileFindSchedule() {
  const [ProfileType, setProfileType] = useState("Profile");
  return (
    <>
      <FindSchedule Type={ProfileType} />
    </>
  );
}

export default InspProfileFindSchedule;
