import { Fragment, useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import Axios from "axios";
import { apipoints } from "../../../../../api/PackInv_API/ReturnableDC/ReturnableDC";
import DeliveryChallan from "../PDFs/DeliveryChallan";
import { lazerData } from "../../../../../../Data/magodData";

// Modal for inspection and packing form, handles DC creation and printing
function InspectionPackingForm({
  showInspModal,
  setShowInspModal,
  closeInspModal,
  handleSave,
  formData,
  updateFormData,
}) {
  const [inspectedBy, setInspectedBy] = useState("");
  const [packedBy, setPackedBy] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showpdfModal, setShowPdfModal] = useState(false);
  const [showgstModal, setShowGstModal] = useState(false);

  const [PDFData, setPDFData] = useState({});

  // Fetches PDF data for the delivery challan
  function fetchPDFData() {
    Axios.post(apipoints.getPDFData,{
      unitName : lazerData.UnitName
    }).then((res) => {
      setPDFData(res.data[0]);
    });
  }

  useEffect(() => {
    fetchPDFData();
  }, []);

  // Handles input changes for inspectedBy and packedBy fields
  const handleInputChange = (e) => {
    if (e.target.name === "inspectedBy") {
      setInspectedBy(e.target.value);
    } else if (e.target.name === "packedBy") {
      setPackedBy(e.target.value);
    }
  };

  // Handles closing of the modal and triggers print/gst modal as needed
  const handleModalClose = () => {
    closeInspModal(inspectedBy, packedBy);
    if (!formData.gstNo) {
      setShowGstModal(true);
    } else {
      setShowPrintModal(true);
    }
  };

  // Handles closing of the print modal
  const handlePrintModalClose = () => {
    setShowPrintModal(false);
  };

  // Handles closing of the GST modal
  const handleGSTModalClose = () => {
    setShowGstModal(false);
  };

  // Handles GST "Yes" button click
  const handleGstYes = () => {
    updateFormData((prevData) => ({
      ...prevData,
      gstNo: "Not Registered",
    }));
    setShowGstModal(false);
    setShowPrintModal(true);
  };

  // Handles GST "No" button click
  const handleGstClose = () => {
    setShowGstModal(false);
  };

  // Handles print "Yes" button click, creates DC and opens PDF modal
  const handlePrintYes = () => {
    const srlType = "ReturnableGoodDC";
    const prefix = `${formData.unitName.charAt(0).toUpperCase()}G`;
    const VoucherNoLength = 4;
    if (inspectedBy.trim() === "" || packedBy.trim() === "") {
      toast.error("Enter the name of Inspected By and Packed By to continue");
      setShowPrintModal(false);
    } else {
      Axios.post(apipoints.createDC, {
        dcInvNo: formData.dcInvNo,
        unit: formData.unitName,
        srlType: srlType,
        prefix: prefix,
        VoucherNoLength: VoucherNoLength,
      })
        .then((response) => {
          if (response.status === 200) {
            toast.success("Returnable DC Created");
            if (response.data[0].DC_Date) {
              const date = new Date(response.data[0].DC_Date);
              const formattedDateString = date.toLocaleDateString("en-GB");
              updateFormData({
                ...formData,
                dcStatus: response.data[0].DCStatus,
                dcDate: formattedDateString,
                dcNo: response.data[0].DC_No,
              });
            } else {
              console.error("No date value received in the response.");
            }
            handleSave();

            setShowPrintModal(false);
            setShowPdfModal(true);
          } else {
            toast.error(
              "Failed to update inspection and packing details. Please try again."
            );
          }
        })
        .catch((error) => {
          console.error(
            "Error while updating inspection and packing details:",
            error
          );
        });
    }
  };

  // Handles closing of the PDF modal
  const handlePdfClose = () => {
    setShowPdfModal(false);
  };

  return (
    <div>
      <Modal show={showInspModal} onHide={handleModalClose} size="md">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "14px" }}>
            Inspection and Packing Form
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row">
            <div className="col-md-4 col-sm-12">
              <label className="form-label">Inspected By</label>
            </div>

            <div className="col-md-6 col-sm-12">
              <input
                autoComplete="off"
                className="input-field"
                type="text"
                name="inspectedBy"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 col-sm-12">
              <label className="form-label">Packed By</label>
            </div>

            <div className="col-md-6 col-sm-12">
              <input
                autoComplete="off"
                className="input-field"
                type="text"
                name="packedBy"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {showPrintModal && (
        <Modal show={showPrintModal} onHide={handlePrintModalClose} size="md">
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "14px" }}>Print</Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ fontSize: "12px" }}>
            Print ReturnableDC?
          </Modal.Body>
          <Modal.Footer>
            <button
              className="button-style"
              style={{ width: "50px" }}
              onClick={handlePrintYes}
            >
              Yes
            </button>

            <button
              className="button-style"
              style={{ width: "50px" }}
              onClick={handlePrintModalClose}
            >
              No
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {showpdfModal && (
        <Modal show={showpdfModal} onHide={handlePdfClose} fullscreen>
          <Modal.Header closeButton>
            <Modal.Title>Returnable Delivery Challan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Fragment>
              <PDFViewer width="1200" height="600" filename="somename.pdf">
                <DeliveryChallan formData={formData} PDFData={PDFData} />
              </PDFViewer>
            </Fragment>
          </Modal.Body>
        </Modal>
      )}

      {showgstModal && (
        <Modal show={showgstModal} onHide={handleGSTModalClose} size="md">
          <Modal.Header closeButton>
            <Modal.Title>Magod ReturnableDC</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            GST No Missing, Is Vendor Not Registerd GST? Select Yes to Print No
            to Exit.
          </Modal.Body>
          <Modal.Footer>
            <button
              className="button-style"
              style={{ width: "50px" }}
              onClick={handleGstYes}
            >
              Yes
            </button>

            <button
              className="button-style"
              style={{ width: "50px", backgroundColor: "rgb(173, 173, 173)" }}
              onClick={handleGstClose}
            >
              No
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default InspectionPackingForm;
