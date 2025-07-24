import { Fragment, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { apipoints } from "../../../../../../api/PackInv_API/ReturnableDC/ReturnableDC";
import Axios from "axios";
import { toast } from "react-toastify";
import { lazerData } from "../../../../../../../Data/magodData";

function EwayBillPdfModal({
  ewayBillPdf,
  closeEwayBillPdf,
  formData,
  DeliveryChallan,
}) {
  const [PDFData, setPDFData] = useState({});
  const [pdfSaved, setPdfSaved] = useState(false);

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

  useEffect(() => {
    if (
      !pdfSaved &&
      ewayBillPdf &&
      formData &&
      Object.keys(PDFData).length > 0
    ) {
      savePdfToServer();
      setPdfSaved(true);
    }
  }, [ewayBillPdf, PDFData]);

  const handleClose = () => {
    setPdfSaved(false);
    closeEwayBillPdf();
  };

  const savePdfToServer = async () => {
    try {
      const adjustment = "Delivery_Challan";

      await Axios.post(apipoints.setAdjustmentName, {
        adjustment,
        type: formData.Type || "Eway Bill",
        OrderNo: formData.OrderNo,
      });

      const blob = await pdf(
        <DeliveryChallan formData={formData} PDFData={PDFData} />
      ).toBlob();

      const pdfFormData = new FormData();

      const file = new File([blob], "GeneratedPDF.pdf", {
        type: "application/pdf",
      });

      pdfFormData.append("file", file);

      const response = await Axios.post(apipoints.savePDF, pdfFormData, {
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
    <Modal show={ewayBillPdf} onHide={handleClose} fullscreen>
      <Modal.Header closeButton>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Modal.Title>Returnable Delivery Challan</Modal.Title>
          <button className="button-style" onClick={savePdfToServer}>
            Save to Server
          </button>
        </div>
      </Modal.Header>

      <Modal.Body>
        <Fragment>
          <PDFViewer width="1200" height="600" filename="Delivery_Challan.pdf">
            <DeliveryChallan formData={formData} PDFData={PDFData} />
          </PDFViewer>
        </Fragment>
      </Modal.Body>
    </Modal>
  );
}

export default EwayBillPdfModal;
