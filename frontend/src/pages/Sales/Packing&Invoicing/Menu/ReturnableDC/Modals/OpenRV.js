import { useState, Fragment, useEffect } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import { apipoints } from "../../../../../api/PackInv_API/ReturnableDC/ReturnableDC";
import Axios from "axios";
import ReceiptVoucher from "../PDFs/ReceiptVoucher";
import { lazerData } from "../../../../../../Data/magodData";

// Modal for opening and managing Receipt Voucher (RV)
function OpenRV({
  showRVModal,
  closeJobWorkModalRV,
  handleInputChange,
  formData,
  updateFormData,
}) {
  const [print, setPrint] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);
  const [cancel, setCancel] = useState(false);

  const [PDFData, setPDFData] = useState({});

  const [pdfSaved, setPdfSaved] = useState(false);

  // Fetches PDF data for the receipt voucher
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
      showRVModal &&
      !pdfSaved &&
      formData &&
      Object.keys(PDFData).length > 0
    ) {
      savePdfToServer();
      setPdfSaved(true);
    }
  }, [showRVModal, PDFData]);

  // Handles closing of the modal and resets pdfSaved
  const handleModalClose = () => {
    setPdfSaved(false);
    closeJobWorkModalRV();
  };

  // Opens the print modal
  const printModal = (e) => {
    e.preventDefault();
    setPrint(true);
  };

  // Closes the print modal
  const printModalClose = () => {
    setPrint(false);
  };

  // Handles print confirmation and opens PDF modal
  const handlePrintYes = () => {
    setPrint(false);
    setPdfModal(true);
  };

  // Opens the cancel modal after validation
  const cancelModal = (e) => {
    e.preventDefault();
    if (!formData.CancelReason || formData.CancelReason.length < 10) {
      toast.error("Enter Proper Reason for Cancel");
    } else {
      setCancel(true);
    }
  };

  // Closes the cancel modal
  const cancelModalClose = () => {
    setCancel(false);
  };

  // Closes the PDF modal
  const handlePdfClose = () => {
    setPdfModal(false);
  };

  // Fetches first table data for RV
  const firstTable = () => {
    Axios.post(apipoints.firstTable, { rvId: formData.selectedRowData.RvID })
      .then((response) => {
        updateFormData((prevData) => ({
          ...prevData,
          firstTable: response.data,
        }));
      })
      .catch((error) => {
        console.error("Error making first API request:", error);
      });
  };

  // Fetches second table data for RV
  const secondTable = () => {
    Axios.post(apipoints.secondTable, {
      dcInvNo: formData.dcInvNo,
    })
      .then((response) => {
        updateFormData((prevData) => ({
          ...prevData,
          secondTable: response.data,
        }));
      })
      .catch((error) => {
        console.error("Error making first API request:", error);
      });
  };

  useEffect(() => {
    if (showRVModal && formData.selectedRowData.RvID) {
      firstTable();
      secondTable();
    }
  }, [showRVModal, formData.selectedRowData.RvID]);

  // Handles cancellation of the receipt voucher
  const handleCancel = async () => {
    try {
      const response = await Axios.post(apipoints.cancel, {
        rvId: formData.selectedRowData.RvID,
        firstTable: formData.firstTable,
        dcInvNo: formData.dcInvNo,
        CancelReason: formData.CancelReason,
      });

      const date = new Date(response.data.updatedRvDate);
      const formattedDateString = date.toLocaleDateString("en-GB");

      updateFormData((prevData) => ({
        ...prevData,
        tableData: response.data.draft_dc_inv_details,
      }));

      updateFormData((prevData) => ({
        ...prevData,
        selectedRowData: {
          ...prevData.selectedRowData,
          RVStatus: response.data.updateRvStatus,
          CancelReason: response.data.CancelReason,
        },
        tableData: response.data.draft_dc_inv_details,
        rvNo: response.data.updatedRVNo,
        CancelReason: response.data.CancelReason,
        rvDate: formattedDateString,
        dcStatus: response.data.draft_dc_inv_register[0].DCStatus,
        RVStatus: response.data.updateRvStatus,
      }));

      const receiveTableData = await Axios.post(apipoints.receiveTable, {
        rvId: formData.selectedRowData.RvID,
        Ref_VrId: formData.dcInvNo,
      });

      updateFormData((prevData) => ({
        ...prevData,
        receiveTable: receiveTableData.data,
        RVStatus: receiveTableData.data[0].RVStatus,
      }));
      toast.success("Receipt Voucher Cancelled");

      setCancel(false);
    } catch (error) {
      console.error(
        "An error occurred during the update:",
        error.message || error
      );
    }
  };

  // Saves the generated PDF to the server
  const savePdfToServer = async () => {
    try {
      const adjustment = "Material_Receipt_Voucher";
      await Axios.post(apipoints.setAdjustmentName, {
        adjustment,
        type: formData.Type || "Receipt Voucher",
        OrderNo: formData.OrderNo,
      });

      const blob = await pdf(
        <ReceiptVoucher formData={formData} PDFData={PDFData} />
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
    <Modal size="sm" show={showRVModal} onHide={handleModalClose} fullscreen>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "14px", fontWeight: "bold" }}>
          Job Work Goods Receipt Voucher
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="d-flex col-md-3 col-sm-12" style={{ gap: "24px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Voucher No
            </label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.selectedRowData.RV_No}
            />
          </div>
          <div className="col-md-2 col-sm-12">
            <input
              type="text"
              className="in-field mt-1"
              disabled
              value={
                formData.selectedRowData.RV_Date
                  ? new Date(
                      formData.selectedRowData.RV_Date
                    ).toLocaleDateString("en-GB")
                  : ""
              }
            />
          </div>
          <div className="col-md-2 col-sm-12">
            <input
              type="text"
              disabled
              className="in-field mt-1"
              value={formData.selectedRowData.RVStatus}
            />
          </div>
          <div className="d-flex col-md-3 col-sm-12" style={{ gap: "10px" }}>
            <label className="form-label">Weight</label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={parseInt(formData.selectedRowData.TotalWeight)}
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="d-flex col-md-4 col-sm-12" style={{ gap: "15px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Receive Form
            </label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.selectedRowData.Customer}
            />
          </div>
          <div className="col-md-3 col-sm-12">
            <input
              type="text"
              disabled
              className="in-field mt-1"
              value={formData.selectedRowData.Cust_Code}
            />
          </div>
          <div className="col-md-5 col-sm-12">
            <button
              className={
                formData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Cancelled"
                  ? "button-style button-disabled"
                  : "button-style"
              }
              disabled={
                formData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Cancelled"
              }
            >
              Save
            </button>

            <button
              className={
                formData.selectedRowData.RVStatus === "Received" ||
                formData.selectedRowData.RVStatus === "Cancelled"
                  ? "button-style button-disabled"
                  : "button-style"
              }
              onClick={cancelModal}
              disabled={
                formData.selectedRowData.RVStatus === "Received" ||
                formData.selectedRowData.RVStatus === "Cancelled"
              }
            >
              Cancel
            </button>

            <button
              className={
                formData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Cancelled"
                  ? "button-style button-disabled"
                  : "button-style"
              }
              disabled={
                formData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Updated" ||
                formData.selectedRowData.dcStatus === "Cancelled"
              }
            >
              Accept
            </button>

            <button className="button-style" onClick={printModal}>
              Print
            </button>
          </div>
        </div>

        <div className="row">
          <div className="d-flex col-md-4 col-sm-12" style={{ gap: "15px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              DC Reference
            </label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.selectedRowData.Ref_VrNo}
            />
          </div>
          <div className="d-flex col-md-3 col-sm-12" style={{ gap: "43px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              GST No
            </label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.selectedRowData.CustGSTNo}
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="d-flex col-md-4 col-sm-12" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Cust Docu Ref
            </label>
            <input
              className="in-field mt-1"
              type="text"
              name="CustDocuNo"
              value={formData.selectedRowData.CustDocuNo}
              disabled={
                formData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Cancelled" ||
                formData.selectedRowData.RVStatus === "Closed"
              }
              autoComplete="off"
            />
          </div>
          <div className="d-flex col-md-3 col-sm-12" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              E Way Bill No
            </label>
            <input
              className="in-field mt-1"
              type="text"
              name="ewayBillNo"
              value={formData.selectedRowData.EWayBillRef}
              disabled={
                formData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Updated" ||
                formData.selectedRowData.RVStatus === "Cancelled" ||
                formData.selectedRowData.RVStatus === "Closed"
              }
              autoComplete="off"
            />
          </div>
          <div className="d-flex col-md-4 col-sm-12" style={{ gap: "10px" }}>
            <label className="form-label">Reason</label>
            <input
              className="in-field mt-1"
              type="text"
              name="CancelReason"
              value={
                formData.selectedRowData.RVStatus === "Updated"
                  ? formData.CancelReason
                  : formData.selectedRowData.CancelReason
              }
              onChange={handleInputChange}
              disabled={formData.selectedRowData.RVStatus === "Cancelled"}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-md-7 col-sm-12">
            <div>
              <button
                className={
                  formData.RVStatus === "Updated" ||
                  formData.selectedRowData.RVStatus === "Updated" ||
                  formData.selectedRowData.RVStatus === "Cancelled"
                    ? "button-style button-disabled"
                    : "button-style"
                }
                disabled={
                  formData.RVStatus === "Updated" ||
                  formData.selectedRowData.RVStatus === "Updated" ||
                  formData.selectedRowData.RVStatus === "Cancelled"
                }
              >
                Remove
              </button>
            </div>

            <div
              className="row mt-3"
              style={{
                overflowY: "scroll",
                overflowX: "scroll",
                maxHeight: "300px",
              }}
            >
              <Table
                striped
                className="table-data border"
                style={{ border: "1px" }}
              >
                <thead
                  className="tableHeaderBGColor"
                  style={{
                    textAlign: "center",
                    position: "sticky",
                    top: "-1px",
                  }}
                >
                  <tr>
                    <th style={{ whiteSpace: "nowrap" }}>Select</th>
                    <th style={{ whiteSpace: "nowrap" }}>Part Name</th>
                    <th style={{ whiteSpace: "nowrap" }}>Part Description</th>
                    <th style={{ whiteSpace: "nowrap" }}>Qty Sent</th>
                    <th style={{ whiteSpace: "nowrap" }}>UOM</th>
                    <th style={{ whiteSpace: "nowrap" }}>Received</th>
                    <th style={{ whiteSpace: "nowrap" }}>Inspected</th>
                    <th style={{ whiteSpace: "nowrap" }}>Accepted</th>
                    <th style={{ whiteSpace: "nowrap" }}>Rejected</th>
                  </tr>
                </thead>

                <tbody className="tablebody">
                  {formData.firstTable?.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          className="mt-1"
                          disabled={
                            formData.selectedRowData.RVStatus === "Updated" ||
                            formData.selectedRowData.dcStatus === "Cancelled"
                          }
                        />
                      </td>
                      <td>{row.Part_Name}</td>
                      <td>{row.Part_Discription}</td>
                      <td>{parseInt(row.DC_Qty)}</td>
                      <td>{row.UOM}</td>
                      <td>
                        <input
                          type="number"
                          name="Qty_Received"
                          value={parseInt(row.Qty_Received)}
                          disabled={
                            formData.selectedRowData.RVStatus === "Updated" ||
                            formData.selectedRowData.dcStatus === "Cancelled"
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            textAlign: "center",
                          }}
                          autoComplete="off"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="Qty_Inspected"
                          value={parseInt(row.Qty_Inspected)}
                          disabled={
                            formData.selectedRowData.RVStatus === "Updated" ||
                            formData.selectedRowData.RVStatus === "Cancelled"
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            textAlign: "center",
                          }}
                          autoComplete="off"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="Qty_Accepted"
                          value={parseInt(row.Qty_Accepted)}
                          disabled={
                            formData.selectedRowData.RVStatus === "Updated" ||
                            formData.selectedRowData.RVStatus === "Cancelled"
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            textAlign: "center",
                          }}
                          autoComplete="off"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="Qty_Rejected"
                          value={parseInt(row.Qty_Rejected)}
                          disabled={
                            formData.selectedRowData.RVStatus === "Updated" ||
                            formData.selectedRowData.RVStatus === "Cancelled"
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            textAlign: "center",
                          }}
                          autoComplete="off"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          <div className="col-md-5 col-sm-12">
            <div>
              <button
                className={
                  formData.RVStatus === "Updated" ||
                  formData.selectedRowData.RVStatus === "Updated" ||
                  formData.selectedRowData.RVStatus === "Cancelled"
                    ? "button-style button-disabled"
                    : "button-style"
                }
                disabled={
                  formData.RVStatus === "Updated" ||
                  formData.selectedRowData.RVStatus === "Updated" ||
                  formData.selectedRowData.RVStatus === "Cancelled"
                }
              >
                Add
              </button>
            </div>

            <div
              className="row mt-3"
              style={{
                overflowY: "scroll",
                overflowX: "scroll",
                maxHeight: "300px",
              }}
            >
              <Table
                striped
                className="table-data border"
                style={{ border: "1px" }}
              >
                <thead className="tableHeaderBGColor">
                  <tr>
                    <th style={{ whiteSpace: "nowrap" }}>Select</th>
                    <th style={{ whiteSpace: "nowrap" }}>Part Name</th>
                    <th style={{ whiteSpace: "nowrap" }}>Part Description</th>
                    <th style={{ whiteSpace: "nowrap" }}>UOM</th>
                    <th style={{ whiteSpace: "nowrap" }}>Sent</th>
                    <th style={{ whiteSpace: "nowrap" }}>Returned</th>
                  </tr>
                </thead>

                <tbody className="tablebody">
                  {formData.secondTable.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          className="mt-1"
                          id={`checkbox_${index}`}
                          disabled={
                            formData.selectedRowData.RVStatus === "Updated" ||
                            formData.selectedRowData.dcStatus === "Cancelled"
                          }
                          checked={row.isSelected}
                        />
                      </td>
                      <td>{row.Dwg_Code}</td>
                      <td>{row.Dwg_No}</td>
                      <td>{row.UOM}</td>
                      <td>{row.Qty}</td>
                      <td>{row.QtyReturned}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </Modal.Body>

      {print && (
        <Modal show={print} onHide={printModalClose}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "14px" }}>
              Magod ReturnableDC
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ fontSize: "12px" }}>
            Print Returned Goods Receipt Voucher?
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
              style={{ width: "50px", backgroundColor: "rgb(173, 173, 173)" }}
              onClick={printModalClose}
            >
              No
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {pdfModal && (
        <Modal show={pdfModal} onHide={handlePdfClose} fullscreen>
          <Modal.Header closeButton>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Modal.Title>Returnable Material Receipt Voucher</Modal.Title>
              <button className="button-style" onClick={savePdfToServer}>
                Save to Server
              </button>
            </div>
          </Modal.Header>
          <Fragment>
            <PDFViewer
              width="1200"
              height="600"
              filename="Material_Receipt_Voucher.pdf"
            >
              <ReceiptVoucher formData={formData} PDFData={PDFData} />
            </PDFViewer>
          </Fragment>
        </Modal>
      )}

      {cancel && (
        <Modal show={cancel} onHide={cancelModalClose}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "14px" }}>
              Magod ReturnableDC
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ fontSize: "12px" }}>
            Do you wish to cancel this Receipt Voucher?
          </Modal.Body>
          <Modal.Footer>
            <button
              className="button-style"
              style={{ width: "50px" }}
              onClick={handleCancel}
            >
              Yes
            </button>

            <button
              className="button-style"
              style={{ width: "50px", backgroundColor: "rgb(173, 173, 173)" }}
              onClick={cancelModalClose}
            >
              No
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </Modal>
  );
}

export default OpenRV;
