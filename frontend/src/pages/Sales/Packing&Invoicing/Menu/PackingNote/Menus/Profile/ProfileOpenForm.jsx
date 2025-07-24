import { useState } from "react";
import PNAccountSelect from "../../Pages/PNAccountSelect";

export default function ProfileOpenForm() {
  const [ProfilePNType, setProfilePNType] = useState("Profile");
  return (
    <>
      <PNAccountSelect PNType={ProfilePNType} />
    </>
  );
}
