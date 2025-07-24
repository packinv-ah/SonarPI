import { useState } from "react";
import PNAccountSelect from "../../Pages/PNAccountSelect";

export default function FabricationOpenForm() {
  const [FabPNType, setFabPNType] = useState("Fabrication");
  return (
    <>
      <PNAccountSelect PNType={FabPNType} />
    </>
  );
}
