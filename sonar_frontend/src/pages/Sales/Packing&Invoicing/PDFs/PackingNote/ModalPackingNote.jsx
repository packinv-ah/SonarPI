import { Fragment, useState, useEffect } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { Modal } from "react-bootstrap";
import PrintPackingNote from "./PrintPackingNote";
import Axios from "axios";
import { toast } from "react-toastify";
import { apipoints } from "../../../../api/PackInv_API/Invoice/Invoice";
import { lazerData } from "../../../../../Data/magodData";

export default function ModalPackingNote(props) {
  const [PDFData, setPDFData] = useState({});
  const [pdfSaved, setPdfSaved] = useState(false);

  var OrderNo = props.invDetailsData[0]?.Order_No;

  // Handles closing the modal and resets pdfSaved state
  const handleClose = () => {
    setPdfSaved(false);
    props.setPrintCopyModal(false);
  };

  // Fetches PDF data for the packing note
  function fetchPDFData() {
    Axios.post(apipoints.getPDFData, {
      unitName: lazerData.UnitName,
    }).then((res) => {
      setPDFData(res.data[0]);
    });
  }

  useEffect(() => {
    fetchPDFData();
  }, []);

  // Auto save PDF when modal opens and data is ready
  useEffect(() => {
    if (
      !pdfSaved &&
      PDFData &&
      Object.keys(PDFData).length > 0 &&
      props.printCopyModal
    ) {
      savePdfToServer();
      setPdfSaved(true);
    }
  }, [PDFData, props.printCopyModal]);

  const rowLimit = 20;

  // Generator function to split array into chunks of n
  function* chunks(arr, n) {
    for (let i = 0; i < arr.length; i += n) {
      yield arr.slice(i, i + n);
    }
  }

  // Saves the generated Packing Note PDF to the server
  const savePdfToServer = async () => {
    try {
      const adjustment = "PN_" + props?.invRegisterData?.DC_No;

      await Axios.post(apipoints.setAdjustmentName, {
        adjustment,
        OrderNo: OrderNo,
        type: props.type,
      });
      const blob = await pdf(
        <PrintPackingNote
          PDFData={PDFData}
          invRegisterData={props.invRegisterData}
          invTaxData={props.invTaxData}
          invDetailsData={[...chunks(props?.invDetailsData, rowLimit)]}
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
      <Modal fullscreen show={props.printCopyModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            Print Packing Note
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
              <PrintPackingNote
                PDFData={PDFData}
                invRegisterData={props.invRegisterData}
                invTaxData={props.invTaxData}
                invDetailsData={[...chunks(props?.invDetailsData, rowLimit)]}
                rowLimit={rowLimit}
              />
            </PDFViewer>
          </Fragment>
        </Modal.Body>
      </Modal>
    </>
  );
}
