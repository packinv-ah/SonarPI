import { useState } from "react";
import PNAccountSelect from "../../Pages/PNAccountSelect";

export default function ServicesOpenForm() {
  const [ServicesPNType, setServicesPNType] = useState("Service");
  return (
    <>
      <PNAccountSelect PNType={ServicesPNType} />
    </>
  );
}
