import { useState } from "react";
import PNAccountSelect from "../../Pages/PNAccountSelect";

export default function MiscOpenForm() {
  const [MiscPNType, setMiscPNType] = useState("Misc");
  return (
    <>
      <PNAccountSelect PNType={MiscPNType} />
    </>
  );
}
