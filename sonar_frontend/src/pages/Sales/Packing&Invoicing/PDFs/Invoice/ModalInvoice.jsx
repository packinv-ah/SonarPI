import { Fragment, useState, useEffect } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { Modal } from "react-bootstrap";
import PrintInvoice from "./PrintInvoice";
import Axios from "axios";
import { toast } from "react-toastify";
import { apipoints } from "../../../../api/PackInv_API/Invoice/Invoice";
import { lazerData } from "../../../../../Data/magodData";

// Modal for displaying and saving the Invoice PDF
export default function ModalInvoice(props) {
  const [PDFData, setPDFData] = useState({});
  const [pdfSaved, setPdfSaved] = useState(false);
  var OrderNo = props.invDetailsData[0]?.Order_No;

  // Handles closing the modal and resets pdfSaved state
  const handleClose = () => {
    setPdfSaved(false);
    props.setPrintInvoiceModal(false);
  };

  // Fetches PDF data for the invoice
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
      props.printInvoiceModal
    ) {
      savePdfToServer();
      setPdfSaved(true);
    }
  }, [PDFData, props.printInvoiceModal]);

  let exciseArr = [];
  for (let i = 0; i < props.invDetailsData.length; i++) {
    const element = props.invDetailsData[i];

    if (exciseArr.filter((obj) => obj === element.Excise_CL_no).length > 0) {
    } else {
      exciseArr.push(element.Excise_CL_no);
    }
  }

  // Saves the generated Invoice PDF to the server
  const savePdfToServer = async () => {
    try {
      const adjustment = "InvoiceNo_" + props?.invRegisterData?.Inv_No; //
      await Axios.post(apipoints.setAdjustmentName, {
        adjustment,
        OrderNo: OrderNo,
        type: props.type,
      });
      const blob = await pdf(
        <PrintInvoice
          PDFData={PDFData}
          rowLimit={props.rowLimit}
          invRegisterData={props.invRegisterData}
          invDetailsData={props.invDetailsData}
          invTaxData={props.invTaxData}
          exciseArr={exciseArr}
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
      <Modal fullscreen show={props.printInvoiceModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            Print Invoice
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
            <PDFViewer width="1358" height="595" filename="Invoice.pdf">
              <PrintInvoice
                PDFData={PDFData}
                rowLimit={props.rowLimit}
                invRegisterData={props.invRegisterData}
                invDetailsData={props.invDetailsData}
                invTaxData={props.invTaxData}
                exciseArr={exciseArr}
              />
            </PDFViewer>
          </Fragment>
        </Modal.Body>
      </Modal>
    </>
  );
}
