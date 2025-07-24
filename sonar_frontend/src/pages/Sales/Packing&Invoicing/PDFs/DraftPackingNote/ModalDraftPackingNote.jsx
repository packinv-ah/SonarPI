import { Fragment, useState, useEffect } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { Modal } from "react-bootstrap";
import PrintDraftPackingNote from "./PrintDraftPackingNote";

import Axios from "axios";

import { toast } from "react-toastify";
import { apipoints } from "../../../../api/PackInv_API/Invoice/Invoice";

// Modal for displaying and saving the Draft Packing Note PDF
export default function ModalPackingNote(props) {
  var OrderNo = props.invDetailsData[0]?.Order_No;

  const [pdfSaved, setPdfSaved] = useState(false);

  // Handles closing the modal and resets pdfSaved state
  const handleClose = () => {
    setPdfSaved(false);
    props.setPrintDraftPNModal(false);
  };

  const rowLimit = 20;

  // Generator function to split array into chunks of n
  function* chunks(arr, n) {
    for (let i = 0; i < arr.length; i += n) {
      yield arr.slice(i, i + n);
    }
  }

  // Auto save PDF when modal opens and data is ready
  useEffect(() => {
    if (
      !pdfSaved &&
      props.printDraftPNModal &&
      props.invRegisterData &&
      props.invDetailsData?.length > 0
    ) {
      savePdfToServer();
      setPdfSaved(true);
    }
  }, [props.printDraftPNModal, props.invRegisterData, props.invDetailsData]);

  // Saves the generated Draft Packing Note PDF to the server
  const savePdfToServer = async () => {
    try {
      const adjustment = "Draft_Packing_Note";

      await Axios.post(apipoints.setAdjustmentName, {
        adjustment,
        OrderNo: OrderNo,
        type: "DraftPN",
      });
      const blob = await pdf(
        <PrintDraftPackingNote
          invRegisterData={props.invRegisterData}
          invTaxData={props.invTaxData}
          invDetailsData={props?.invDetailsData}
          rowLimit={rowLimit}
        />
      ).toBlob();

      const file = new File([blob], "GeneratedPDF.pdf", {
        type: "application/pdf",
      });

      const formData = new FormData();

      formData.append("file", file);

      const response = await Axios.post(apipoints.savePDF, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("PDF saved successfully!");
      }
    } catch (error) {
      console.error("Error saving PDF to server:", error);
      toast.error(error?.response?.data?.message || "Unable to save PDF");
    }
  };

  return (
    <>
      <Modal fullscreen show={props.printDraftPNModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            Print Draft Packing Note
            <button
              className="button-style"
              variant="primary"
              style={{ fontSize: "10px", marginRight: "35px" }}
              onClick={savePdfToServer}
            >
              Save to Server
            </button>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="m-0 p-1">
          <Fragment>
            <PDFViewer width="1358" height="595" filename="PackingNote.pdf">
              <PrintDraftPackingNote
                invRegisterData={props.invRegisterData}
                invTaxData={props.invTaxData}
                invDetailsData={props?.invDetailsData}
                rowLimit={rowLimit}
              />
            </PDFViewer>
          </Fragment>
        </Modal.Body>
      </Modal>
    </>
  );
}
