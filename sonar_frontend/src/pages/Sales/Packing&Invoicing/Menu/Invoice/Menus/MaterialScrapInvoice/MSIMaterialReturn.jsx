import Form from "../../Pages/Form";

export default function MSIMaterialReturn() {
  const baseHeading = "Material Scrap Sales";

  return (
    <>
      <Form
        DC_InvType={baseHeading}
        InvoiceFor={"Material"}
        heading={`${baseHeading} Create New`}
      />
    </>
  );
}
