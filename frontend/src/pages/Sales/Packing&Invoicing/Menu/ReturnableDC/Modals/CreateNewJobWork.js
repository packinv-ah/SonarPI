import { useState, Fragment, useEffect } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import { apipoints } from "../../../../../api/PackInv_API/ReturnableDC/ReturnableDC";
import Axios from "axios";
import ReceiptVoucher from "../PDFs/ReceiptVoucher";
import { lazerData } from "../../../../../../Data/magodData";

// Modal for creating and managing Job Work Receipt Vouchers
function CreateNewJobWork({
  showJobWorkModal,
  closeJobWorkModal,
  handleInputChange,
  formData,
  updateFormData,
}) {
  const [accept, setAccept] = useState(false);
  const [print, setPrint] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);
  const [cancel, setCancel] = useState(false);

  const [isReceivedDisabled, setIsReceivedDisabled] = useState(false);
  const [isInspectedEnabled, setIsInspectedEnabled] = useState(false);
  const [isAcceptedEnabled, setIsAcceptedEnabled] = useState(false);

  const [maxAllowedQty, setMaxAllowedQty] = useState(0);

  const [PDFData, setPDFData] = useState({});

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

  // Closes the accept modal
  const acceptModalClose = () => {
    setAccept(false);
  };

  // Opens the print modal
  const printModal = (e) => {
    e.preventDefault();
    setPrint(true);
  };

  // Closes the print modal
  const printModalClose = () => {
    setPrint(false);
    setAccept(false);
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

  // Handles print confirmation and opens PDF modal
  const handlePrintYes = () => {
    setAccept(false);
    setPrint(false);
    setCancel(false);
    setPdfModal(true);
  };

  // Closes the PDF modal
  const handlePdfClose = () => {
    setPdfModal(false);
  };

  // Fetches first table data for job work
  const firstTable = () => {
    Axios.post(apipoints.firstTable, { rvId: formData.rvId })
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

  // Fetches second table data for job work
  const secondTable = () => {
    Axios.post(apipoints.secondTable, { dcInvNo: formData.dcInvNo })
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
    if (showJobWorkModal && formData.rvId) {
      firstTable();
      secondTable();
    }
  }, [showJobWorkModal, formData.rvId]);

  // Handles input changes in the editable job work tables
  const handleEditChange = (event, field, index) => {
    const { value } = event.target;

    if (field === "Qty_Received") {
      const enteredValue = parseInt(value);
      const dcQty = parseInt(formData.firstTable[index].DC_Qty);
      const Qty = parseInt(formData.secondTable[index].Qty);
      const qtyReturned = parseInt(formData.secondTable[index].QtyReturned);

      const newMaxAllowedQty = Math.min(dcQty, Qty - qtyReturned);

      if (enteredValue > dcQty) {
        setIsInspectedEnabled(true);
        setIsAcceptedEnabled(true);
        toast.error("Cannot Receive More than Quantity Sent");
      } else if (!isNaN(enteredValue) && enteredValue > newMaxAllowedQty) {
        setIsInspectedEnabled(true);
        setIsAcceptedEnabled(true);
        toast.error(`Qty_Received cannot be greater than ${newMaxAllowedQty}`);
        setMaxAllowedQty(newMaxAllowedQty);
      } else {
        setIsInspectedEnabled(false);
        setIsAcceptedEnabled(false);
        setMaxAllowedQty(newMaxAllowedQty);
      }
    }

    if (field === "Qty_Inspected") {
      const enteredValue = parseInt(value);
      const qtyReceived = parseInt(formData.firstTable[index].Qty_Received);

      if (enteredValue > qtyReceived) {
        setIsAcceptedEnabled(true);
        toast.error("Cannot Inspect More than Quantity Received");
      } else {
        setIsAcceptedEnabled(false);
      }
    }

    if (field === "Qty_Accepted") {
      const enteredValue = parseInt(value);
      const Qty_Received = parseInt(formData.firstTable[index].Qty_Received);
      if (enteredValue > Qty_Received) {
        toast.error("Cannot Accept More than Quantity Received");
      }
    }

    updateFormData((prevData) => {
      const updatedFirstTable = [...prevData.firstTable];
      updatedFirstTable[index][field] = value;

      const qtyReceived = parseInt(updatedFirstTable[index].Qty_Received);
      const qtyInspected = parseInt(updatedFirstTable[index].Qty_Inspected);
      const qtyAccepted = parseInt(updatedFirstTable[index].Qty_Accepted);

      updatedFirstTable[index].Qty_Rejected =
        isNaN(qtyReceived) || isNaN(qtyAccepted)
          ? 0
          : Math.max(qtyReceived - qtyAccepted, 0);

      if (qtyReceived < 0) {
        updatedFirstTable[index].Qty_Received = 0;
      }

      if (qtyAccepted < 0) {
        updatedFirstTable[index].Qty_Accepted = 0;
      }

      if (qtyInspected < 0) {
        updatedFirstTable[index].Qty_Inspected = 0;
      }

      return {
        ...prevData,
        firstTable: updatedFirstTable,
      };
    });
  };

  // Handles checkbox selection in the first table
  const handleCheckboxChangeFirstTable = (event, rowData) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      updateFormData((prevData) => ({
        ...prevData,
        firstTableArray: [...prevData.firstTableArray, rowData],
      }));
    } else {
      updateFormData((prevData) => ({
        ...prevData,
        firstTableArray: prevData.firstTableArray.filter(
          (item) => item !== rowData
        ),
      }));
    }
  };

  // Handles checkbox selection in the second table
  const handleCheckboxChangeSecondTable = (event, rowData) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      updateFormData((prevData) => ({
        ...prevData,
        secondTableArray: [...prevData.secondTableArray, rowData],
      }));
    } else {
      updateFormData((prevData) => ({
        ...prevData,
        secondTableArray: prevData.secondTableArray.filter(
          (item) => item !== rowData
        ),
      }));
    }
  };

  // Removes selected rows from the first table
  const remove = () => {
    if (formData.firstTableArray.length > 0) {
      const selectedIds = formData.firstTableArray?.map((row) => row.Id);

      Axios.post(apipoints.removeFirstTableData, {
        ids: selectedIds,
        rvId: formData.rvId,
      })
        .then((response) => {
          updateFormData((prevData) => ({
            ...prevData,
            firstTable: response.data,
            firstTableArray: [],
          }));
        })
        .catch((error) => {
          console.error("Error during delete operation:", error);
        });
    } else {
      toast.warn("Select rows to Remove");
    }
  };

  // Adds selected rows from the second table to the first table
  const handleAddButtonClick = () => {
    if (formData.secondTableArray.length > 0) {
      const selectedRows = formData.secondTableArray.filter(
        (row) => row.Draft_dc_inv_DetailsID
      );

      if (selectedRows.length > 0) {
        Axios.post(apipoints.addToFirstTable, {
          rowsToAdd: selectedRows,
          rvId: formData.rvId,
        })
          .then((response) => {
            updateFormData((prevData) => ({
              ...prevData,
              firstTable: response.data,
              secondTableArray: [],
            }));

            const selectedIndices = selectedRows?.map((selectedRow) =>
              formData.secondTable.findIndex(
                (row) =>
                  row.Draft_dc_inv_DetailsID ===
                  selectedRow.Draft_dc_inv_DetailsID
              )
            );

            selectedIndices.forEach((index) => {
              const checkbox = document.getElementById(`checkbox_${index}`);
              if (checkbox) {
                checkbox.checked = false;
              }
            });
          })
          .catch((error) => {
            console.error("Error during add operation:", error);
          });
      }
    } else {
      toast.warn("Select rows to Add");
    }
  };

  // Handles saving the job work data
  const handleSave = async () => {
    try {
      const hasErrors = formData.firstTable.some((row) => {
        const enteredValue = parseInt(row.Qty_Received);
        const dcQty = parseInt(row.DC_Qty);

        const correspondingSecondTableRow = formData.secondTable.find(
          (secondRow) => secondRow.Draft_dc_inv_DetailsID === row.Rv_SrlId
        );

        if (correspondingSecondTableRow) {
          const Qty = parseInt(correspondingSecondTableRow.Qty);
          const qtyReturned = parseInt(correspondingSecondTableRow.QtyReturned);

          const maxAllowedQuantity = Math.min(dcQty, Qty - qtyReturned);

          return (
            enteredValue > dcQty ||
            (!isNaN(enteredValue) && enteredValue > maxAllowedQuantity)
          );
        }

        return false;
      });

      const hasReceivedErrors = formData.firstTable.some((row) => {
        const enteredValue = parseInt(row.Qty_Received);
        const dcQty = parseInt(row.DC_Qty);

        return enteredValue > dcQty;
      });

      const hasInspectedErrors = formData.firstTable.some((row) => {
        const enteredValue = parseInt(row.Qty_Inspected);
        const qtyReceived = parseInt(row.Qty_Received);
        return enteredValue > qtyReceived;
      });

      const hasAcceptedErrors = formData.firstTable.some((row) => {
        const enteredValue = parseInt(row.Qty_Accepted);
        const qtyReceived = parseInt(row.Qty_Received);
        return enteredValue > qtyReceived;
      });

      const hasBlankErrors = formData.firstTable.some((row) => {
        return (
          isNaN(parseFloat(row.Qty_Received)) ||
          isNaN(parseFloat(row.Qty_Inspected)) ||
          isNaN(parseFloat(row.Qty_Accepted))
        );
      });

      if (hasReceivedErrors) {
        toast.error("Cannot Receive More than Quantity Sent");
      } else if (hasErrors) {
        toast.error(`Qty_Received cannot be greater than ${maxAllowedQty}`);
      } else if (hasInspectedErrors) {
        toast.error("Cannot Inspect More than Quantity Received");
      } else if (hasAcceptedErrors) {
        toast.error("Cannot Accept More than Quantity Received");
      } else if (hasBlankErrors) {
        toast.error("Numeric Value Required");
      } else {
        const response = await Axios.post(apipoints.saveJobWork, {
          firstTable: formData.firstTable,
          rvId: formData.rvId,
          CustDocuNo: formData.CustDocuNo,
          CustGSTNo: formData.CustGSTNo,
          RVStatus: formData.RVStatus,
          UpDated: formData.UpDated,
          Type: formData.Type,
          Ref_VrId: formData.dcInvNo,
          Ref_VrNo: formData.Ref_VrNo,
          CancelReason: formData.CancelReason,
        });

        if (response.data && response.data.firstTable) {
          updateFormData((prevData) => ({
            ...prevData,
            firstTable: response.data.firstTable,
          }));
        }

        toast.success("Data Saved");
      }
    } catch (error) {
      console.error("An error occurred while saving:", error.message || error);
    }
  };

  // Handles acceptance of the job work and updates state
  const acceptModal = async () => {
    try {
      const hasErrors = formData.firstTable.some((row) => {
        const enteredValue = parseInt(row.Qty_Received);
        const dcQty = parseInt(row.DC_Qty);

        const correspondingSecondTableRow = formData.secondTable.find(
          (secondRow) => secondRow.Draft_dc_inv_DetailsID === row.Rv_SrlId
        );

        if (correspondingSecondTableRow) {
          const Qty = parseInt(correspondingSecondTableRow.Qty);
          const qtyReturned = parseInt(correspondingSecondTableRow.QtyReturned);

          const maxAllowedQuantity = Math.min(dcQty, Qty - qtyReturned);

          return (
            enteredValue > dcQty ||
            (!isNaN(enteredValue) && enteredValue > maxAllowedQuantity)
          );
        }

        return false;
      });

      const hasReceivedErrors = formData.firstTable.some((row) => {
        const enteredValue = parseInt(row.Qty_Received);
        const dcQty = parseInt(row.DC_Qty);
        return enteredValue > dcQty;
      });

      const hasInspectedErrors = formData.firstTable.some((row) => {
        const enteredValue = parseInt(row.Qty_Inspected);
        const qtyReceived = parseInt(row.Qty_Received);
        return enteredValue > qtyReceived;
      });

      const hasAcceptedErrors = formData.firstTable.some((row) => {
        const enteredValue = parseInt(row.Qty_Accepted);
        const qtyReceived = parseInt(row.Qty_Received);
        return enteredValue > qtyReceived;
      });

      const hasBlankErrors = formData.firstTable.some((row) => {
        return (
          isNaN(parseFloat(row.Qty_Received)) ||
          isNaN(parseFloat(row.Qty_Inspected)) ||
          isNaN(parseFloat(row.Qty_Accepted))
        );
      });

      if (hasReceivedErrors) {
        toast.error("Cannot Receive More than Quantity Sent");
      } else if (hasErrors) {
        toast.error(`Qty_Received cannot be greater than ${maxAllowedQty}`);
      } else if (hasInspectedErrors) {
        toast.error("Cannot Inspect More than Quantity Received");
      } else if (hasAcceptedErrors) {
        toast.error("Cannot Accept More than Quantity Received");
      } else if (hasBlankErrors) {
        toast.error("Numeric Value Required");
      } else {
        const response = await Axios.post(apipoints.saveJobWork, {
          firstTable: formData.firstTable,
          rvId: formData.rvId,
          CustDocuNo: formData.CustDocuNo,
          CustGSTNo: formData.CustGSTNo,
          RVStatus: formData.RVStatus,
          UpDated: formData.UpDated,
          Type: formData.Type,
          Ref_VrId: formData.dcInvNo,
          Ref_VrNo: formData.Ref_VrNo,
          CancelReason: formData.CancelReason,
        });

        if (response.data && response.data.firstTable) {
          updateFormData((prevData) => ({
            ...prevData,
            firstTable: response.data.firstTable,
          }));
        }

        const acceptanceErrors = formData.firstTable.filter((row) => {
          const qtyAccepted = parseInt(row.Qty_Accepted);
          const qtyRejected = parseInt(row.Qty_Rejected);
          const qtyReceived = parseInt(row.Qty_Received);
          return qtyAccepted + qtyRejected !== qtyReceived;
        });

        if (formData.CustDocuNo.trim() === "") {
          toast.error("Enter Customer Docu Reference");
        } else if (formData.ewayBillNo.trim() === "") {
          toast.error("Enter E Way Bill Reference, NIL if no E Way Bill");
        } else if (acceptanceErrors.length > 0) {
          const srlToUpdate = acceptanceErrors[0].Srl;
          setTimeout(() => {
            toast.error(`Update Qty Accepted for Srl ${srlToUpdate}`);
          }, 1000);
        } else {
          setAccept(true);
        }
      }
    } catch (error) {
      console.error("An error occurred while saving", error.message || error);
    }
  };

  // Gets a new RV number from backend
  const getRVNo = async () => {
    const srlType = "ReturnedGoodsVr";
    const ResetPeriod = "FinanceYear";
    const ResetValue = 0;
    const VoucherNoLength = 4;
    const prefix = `${formData.unitName.charAt(0).toUpperCase()}`;
    try {
      await Axios.post(apipoints.insertRunNoRow, {
        unit: formData.unitName,
        srlType: srlType,
        ResetPeriod: ResetPeriod,
        ResetValue: ResetValue,
        VoucherNoLength: VoucherNoLength,
        prefix: prefix,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handles acceptance and updates state after accepting job work
  const handleAccept = async () => {
    const srlType = "ReturnedGoodsVr";
    const prefix = `${formData.unitName.charAt(0).toUpperCase()}`;
    const VoucherNoLength = 4;
    try {
      const response = await Axios.post(apipoints.accept, {
        rvId: formData.rvId,
        firstTable: formData.firstTable,
        dcInvNo: formData.dcInvNo,
        ewayBillNo: formData.ewayBillNo,
        unit: formData.unitName,
        srlType: srlType,
        prefix: prefix,
        VoucherNoLength: VoucherNoLength,
      });

      const date = new Date(response.data.updatedRvDate);
      const formattedDateString = date.toLocaleDateString("en-GB");

      updateFormData((prevData) => ({
        ...prevData,
        tableData: response.data.draft_dc_inv_details,
        rvNo: response.data.updatedRVNo,
        rvDate: formattedDateString,
        dcStatus: response.data.draft_dc_inv_register[0].DCStatus,
        RVStatus: response.data.updatedRvStatus,
      }));

      const receiveTableData = await Axios.post(apipoints.receiveTable, {
        rvId: formData.rvId,
        Ref_VrId: formData.dcInvNo,
      });

      updateFormData((prevData) => ({
        ...prevData,
        receiveTable: receiveTableData.data,
      }));

      setAccept(false);
      setPrint(true);
    } catch (error) {
      console.error(
        "An error occurred during the update:",
        error.message || error
      );
    }
  };

  // Handles cancellation of the receipt voucher
  const handleCancel = async () => {
    try {
      const response = await Axios.post(apipoints.cancel, {
        rvId: formData.rvId,
        firstTable: formData.firstTable,
        dcInvNo: formData.dcInvNo,
        CancelReason: formData.CancelReason,
      });

      const date = new Date(response.data.updatedRvDate);
      const formattedDateString = date.toLocaleDateString("en-GB");

      updateFormData((prevData) => ({
        ...prevData,
        tableData: response.data.draft_dc_inv_details,
        rvNo: response.data.updatedRVNo,
        CancelReason: response.data.CancelReason,
        rvDate: formattedDateString,
        dcStatus: response.data.draft_dc_inv_register[0].DCStatus,
        RVStatus: response.data.updateRvStatus,
      }));

      const receiveTableData = await Axios.post(apipoints.receiveTable, {
        rvId: formData.rvId,
        Ref_VrId: formData.dcInvNo,
      });

      updateFormData((prevData) => ({
        ...prevData,
        receiveTable: receiveTableData.data,
      }));
      toast.success("Receipt Voucher Cancelled");

      setAccept(false);
      setCancel(false);
    } catch (error) {
      console.error(
        "An error occurred during the update:",
        error.message || error
      );
    }
  };

  // Prevents invalid characters in number fields
  const blockInvalidChar = (e) =>
    ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault();

  // Saves the generated PDF to the server
  const savePdfToServer = async () => {
    try {
      const adjustment = "Material_Receipt_Voucher";
      await Axios.post(apipoints.setAdjustmentName, {
        adjustment,
        type: formData.Type || "Job Work",
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
    <Modal show={showJobWorkModal} onHide={closeJobWorkModal} fullscreen>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "14px", fontWeight: "bold" }}>
          Job Work Goods Receipt Voucher
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="row">
          <div className="d-flex col-md-3 col-sm-12" style={{ gap: "23px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Voucher No
            </label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.rvNo}
            />
          </div>
          <div className="d-flex col-md-4 col-sm-12" style={{ gap: "10px" }}>
            <input
              type="text"
              className="in-field mt-1"
              disabled
              value={formData.rvDate}
            />
            <input
              type="text"
              disabled
              className="in-field mt-1"
              value={formData.RVStatus}
            />
          </div>
          <div className="d-flex col-md-3 col-sm-12" style={{ gap: "10px" }}>
            <label className="form-label">Weight</label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={parseInt(formData.rvTotalWeight)}
            />
          </div>
        </div>

        <div className="row">
          <div
            className="d-flex col-md-4 col-sm-12 mt-1"
            style={{ gap: "15px" }}
          >
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Receive From
            </label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.rvCustomer}
            />
          </div>
          <div className="col-md-3 col-sm-12 mt-1">
            <input
              type="text"
              disabled
              className="in-field mt-1"
              value={formData.rvCustCode}
            />
          </div>
          <div className="col-md-3 col-sm-12">
            <button
              className={
                formData.RVStatus === "Updated" ||
                formData.RVStatus === "Cancelled"
                  ? "button-style button-disabled"
                  : "button-style"
              }
              disabled={
                formData.RVStatus === "Updated" ||
                formData.RVStatus === "Cancelled"
              }
              onClick={handleSave}
            >
              Save
            </button>

            <button
              className={
                formData.RVStatus === "Updated" ||
                formData.RVStatus === "Cancelled"
                  ? "button-style button-disabled"
                  : "button-style"
              }
              disabled={
                formData.RVStatus === "Updated" ||
                formData.RVStatus === "Cancelled"
              }
              // onClick={acceptModal}
              onClick={() => {
                getRVNo();
                acceptModal();
              }}
            >
              Accept
            </button>

            <button className="button-style" onClick={printModal}>
              Print
            </button>

            <button
              className={
                formData.RVStatus === "Received" ||
                formData.RVStatus === "Cancelled"
                  ? // maxAllowedQty === 0
                    "button-style button-disabled"
                  : "button-style"
              }
              onClick={cancelModal}
              disabled={
                formData.RVStatus === "Received" ||
                // maxAllowedQty === 0 ||
                formData.RVStatus === "Cancelled"
              }
            >
              Cancel
            </button>
          </div>
          {/* <div className="col-md-3 col-sm-12">
            <button
              className={
                formData.RVStatus === "Received" ||
                formData.RVStatus === "Cancelled"
                  ? // maxAllowedQty === 0
                    "button-style button-disabled"
                  : "button-style"
              }
              onClick={cancelModal}
              disabled={
                formData.RVStatus === "Received" ||
                // maxAllowedQty === 0 ||
                formData.RVStatus === "Cancelled"
              }
            >
              Cancel
            </button>
          </div> */}
        </div>

        <div className="row">
          <div className="d-flex col-md-4 col-sm-12" style={{ gap: "14px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              DC Reference
            </label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.Ref_VrNo}
            />
          </div>
          <div className="d-flex col-md-3 col-sm-12" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              GST No
            </label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.CustGSTNo}
            />
          </div>
          <div className="col-md-2 col-sm-12">
            {/* <button
              className={
                formData.RVStatus === "Updated" ||
                formData.RVStatus === "Cancelled"
                  ? "button-style button-disabled"
                  : "button-style"
              }
              disabled={
                formData.RVStatus === "Updated" ||
                formData.RVStatus === "Cancelled"
              }
              // onClick={acceptModal}
              onClick={() => {
                getRVNo();
                acceptModal();
              }}
            >
              Accept
            </button> */}
          </div>
          <div className="col-md-3 col-sm-12">
            {/* <button className="button-style" onClick={printModal}>
              Print
            </button> */}
          </div>
        </div>

        <div className="row mt-1">
          <div className="d-flex col-md-4 col-sm-12" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Cust Docu Ref
            </label>
            <input
              className="in-field mt-1"
              type="text"
              name="CustDocuNo"
              value={formData.CustDocuNo}
              onChange={handleInputChange}
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
              value={formData.ewayBillNo}
              onChange={handleInputChange}
              autoComplete="off"
            />
          </div>
          <div className="d-flex col-md-4 col-sm-12" style={{ gap: "10px" }}>
            <label className="form-label">Reason</label>
            <input
              className="in-field mt-1"
              type="text"
              name="CancelReason"
              value={formData.CancelReason}
              onChange={handleInputChange}
              disabled={
                formData.RVStatus === "Cancelled" ||
                formData.RVStatus === "Received"
              }
              autoComplete="off"
            />
          </div>
        </div>

        <div className="row mt-1">
          <div className="col-md-7 col-sm-12">
            <div>
              <button
                className={
                  formData.RVStatus === "Updated" ||
                  formData.RVStatus === "Cancelled"
                    ? "button-style button-disabled"
                    : "button-style"
                }
                disabled={
                  formData.RVStatus === "Updated" ||
                  formData.RVStatus === "Cancelled"
                }
                onClick={remove}
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
                          id={`checkbox_${index}`}
                          onChange={(e) =>
                            handleCheckboxChangeFirstTable(e, row)
                          }
                          checked={formData.firstTableArray.includes(row)}
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
                          onKeyDown={blockInvalidChar}
                          disabled={isReceivedDisabled}
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            textAlign: "center",
                          }}
                          onChange={(e) =>
                            handleEditChange(e, "Qty_Received", index)
                          }
                          autoComplete="off"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="Qty_Inspected"
                          value={parseInt(row.Qty_Inspected)}
                          onKeyDown={blockInvalidChar}
                          disabled={
                            formData.RVStatus === "Updated" ||
                            formData.RVStatus === "Cancelled" ||
                            isInspectedEnabled
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            textAlign: "center",
                          }}
                          onChange={(e) =>
                            handleEditChange(e, "Qty_Inspected", index)
                          }
                          autoComplete="off"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="Qty_Accepted"
                          value={parseInt(row.Qty_Accepted)}
                          onKeyDown={blockInvalidChar}
                          disabled={
                            formData.RVStatus === "Updated" ||
                            formData.RVStatus === "Cancelled" ||
                            isAcceptedEnabled
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            textAlign: "center",
                          }}
                          onChange={(e) =>
                            handleEditChange(e, "Qty_Accepted", index)
                          }
                          autoComplete="off"
                        />
                      </td>
                      <td>{parseInt(row.Qty_Rejected)}</td>
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
                  formData.RVStatus === "Cancelled"
                    ? "button-style button-disabled"
                    : "button-style"
                }
                disabled={
                  formData.RVStatus === "Updated" ||
                  formData.RVStatus === "Cancelled"
                }
                onClick={handleAddButtonClick}
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
                  {formData.secondTable?.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          className="mt-1"
                          id={`checkbox_${index}`}
                          onChange={(e) =>
                            handleCheckboxChangeSecondTable(e, row)
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

      {accept && (
        <Modal show={accept} onHide={acceptModalClose}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "14px" }}>
              Magod ReturnableDC
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ fontSize: "12px" }}>
            Are you accepting the good returned and accepted/rejected?
          </Modal.Body>
          <Modal.Footer>
            <button
              className="button-style"
              style={{ width: "50px" }}
              onClick={handleAccept}
            >
              Yes
            </button>

            <button
              className="button-style"
              style={{ width: "50px", backgroundColor: "rgb(173, 173, 173)" }}
              onClick={acceptModalClose}
            >
              No
            </button>
          </Modal.Footer>
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
    </Modal>
  );
}

export default CreateNewJobWork;
