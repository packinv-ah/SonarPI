import { useState } from "react";
import { Link } from "react-router-dom";
import { apipoints } from "../../../../../../api/PackInv_API/Inspection/InspProfi";
import FirstTable from "./ReadyForPackingTables/FirstTable";
import SecondTable from "./ReadyForPackingTables/SecondTable";
import ThirdTable from "./ReadyForPackingTables/ThirdTable";
import { toast } from "react-toastify";
import Axios from "axios";
import ModalPackingNote from "../../../../PDFs/PackingNote/ModalPackingNote";
import ConfirmationModal from "../Modals/ConfirmationModal";
import InspectionAndPacking from "../Modals/InspectionAndPacking";
import ModalDraftPackingNote from "../../../../PDFs/DraftPackingNote/ModalDraftPackingNote";
import { lazerData } from "../../../../../../../Data/magodData";

// ReadyForPacking handles the packing note workflow including draft, print, delete, and prepare actions
export default function ReadyForPacking(props) {
  const todayDate = new Date();
  const [runningNoData, setRunningNoData] = useState({});
  const [formData, setFormData] = useState({
    unitName: lazerData.UnitName,
  });
  const [printPNModal, setPrintPNModal] = useState(false);
  const [printDraftPNModal, setPrintDraftPNModal] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmationModalFor, setConfirmationModalFor] = useState("");
  const [selectedRegisterRow, setSelectedRegisterRow] = useState({});
  const [InspectionAndPackingModal, setInspectionAndPackingModal] =
    useState(false);

  // Replaces empty or invalid Qty/Unit_Wt with zero in invDetailsData
  const replaceZeroEmptyWithZero = () => {
    let arr = [];
    for (let i = 0; i < props.invDetailsData.length; i++) {
      const element = props.invDetailsData[i];
      if (parseInt(element.Qty).toString() === "NaN") {
        element.Qty = 0;
      }
      if (parseFloat(element.Unit_Wt).toString() === "NaN") {
        element.Unit_Wt = 0;
      }
      arr.push(element);
      props.setInvDetailsData(arr);
    }
  };

  // Saves the draft packing note after validation
  const saveDraftPNFunc = () => {
    if (props.invDetailsData.length === 0) {
      toast.warning("Please select the packing note for printing");
    } else {
      replaceZeroEmptyWithZero();
      let invDataToPost = [];
      for (let i = 0; i < props.invDetailsData.length; i++) {
        const element = props.invDetailsData[i];
        if (parseInt(element.Qty) < 0) {
          toast.warning("Qty can't be negative");
          break;
        } else if (parseInt(element.Qty) === 0) {
          toast.warning("Qty can't be zero");
          break;
        } else if (parseFloat(element.Unit_Wt) < 0.0) {
          toast.warning("Weight can't be negative");
          break;
        } else if (parseFloat(element.Unit_Wt) === 0.0) {
          toast.warning("Weight can't be zero");
          break;
        } else {
          element.Qty = parseInt(element.Qty);
          element.Unit_Wt = parseFloat(element.Unit_Wt).toFixed(3);
          invDataToPost.push(element);
        }
      }
      if (invDataToPost.length === props.invDetailsData.length) {
        Axios.post(apipoints.saveDraftPN, {
          invDetailsData: invDataToPost,
        }).then((res) => {
          if (res.data.flag === 0) {
            toast.error(res.data.message);
          } else if (res.data.flag === 1) {
            props.getOrderScheduleData();
            toast.success(res.data.message);
          } else {
            toast.error("Uncaught error found");
          }
        });
      }
    }
  };

  // Gets the next running number for the packing note
  const getDCNo = async () => {
    let finYear = `${
      (todayDate.getMonth() + 1 < 4
        ? todayDate.getFullYear() - 1
        : todayDate.getFullYear()
      )
        .toString()
        .slice(-2) +
      "/" +
      (todayDate.getMonth() + 1 < 4
        ? todayDate.getFullYear()
        : todayDate.getFullYear() + 1
      )
        .toString()
        .slice(-2)
    }`;
    let srlType = "PkngNoteNo";
    if (
      selectedRegisterRow.Dc_InvType === "Internal" ||
      selectedRegisterRow.Cust_Code === "0000"
    ) {
      srlType = "InternalDC";
    }
    const ResetPeriod = "FinanceYear";
    const ResetValue = 0;
    const Length = 5;
    Axios.post(apipoints.insertAndGetRunningNo, {
      finYear: finYear,
      unitName: formData.unitName,
      srlType: srlType,
      ResetPeriod: ResetPeriod,
      ResetValue: ResetValue,
      Length: Length,
    }).then((res) => {
      setRunningNoData(res.data.runningNoData);
    });
  };

  // Creates a draft packing note for selected rows
  const createDraftPNFunc = () => {
    let rowsForCreateDraftPN = [];
    for (let i = 0; i < props.selectedReadyForPackingRows.length; i++) {
      const element = props.selectedReadyForPackingRows[i];
      if (
        parseInt(element.QtyCleared) -
          parseInt(element.QtyPacked) -
          parseInt(element.InDraftPN) >
        0
      ) {
        rowsForCreateDraftPN.push(element);
      }
    }
    if (rowsForCreateDraftPN.length > 0) {
      Axios.post(apipoints.postCreateDraftPN, {
        headerData: props.headerData,
        rowsForCreateDraftPN: rowsForCreateDraftPN,
      }).then((res) => {
        if (res.data.flag === 0) {
          toast.error(res.data.message);
        } else {
          props.getOrderScheduleData();
          toast.success(res.data.message);
        }
      });
    } else {
      toast.warning(
        "No materials with sufficient quantity to Create Draft PN, select another material"
      );
    }
  };

  // Prints the draft packing note after saving
  const printDraftPNFunc = () => {
    if (props.invDetailsData.length === 0) {
      toast.warning("Please select the packing note for printing");
    } else {
      saveDraftPNFunc();
      setPrintDraftPNModal(true);
    }
  };

  // Deletes the selected draft packing note
  const deleteDraftPNFunc = () => {
    Axios.post(apipoints.deleteDraftPN, {
      DC_Inv_No: selectedRegisterRow.DC_Inv_No,
    }).then((res) => {
      if (res.data.flag === 0) {
        toast.error(res.data.message);
      } else if (res.data.flag === 1) {
        props.getOrderScheduleData();
        setSelectedRegisterRow({});
        props.setInvDetailsData([]);
        toast.success(res.data.message);
      } else {
        toast.error("Uncaught error found");
      }
    });
  };

  // Prepares the packing note for finalization
  const preparePNFunc = () => {
    Axios.post(apipoints.preparePN, {
      DC_Inv_No: selectedRegisterRow.DC_Inv_No,
      insAndPack: props.insAndPack,
      invDetailsData: props.invDetailsData,
      runningNoData: runningNoData,
    }).then((res) => {
      if (res.data.flag === 0) {
        toast.error(res.data.message);
        setInspectionAndPackingModal(false);
      } else if (res.data.flag === 1) {
        props.getOrderScheduleData();
        setSelectedRegisterRow({});
        props.setInvDetailsData([]);
        toast.success(res.data.message);
        setInspectionAndPackingModal(false);
      } else {
        setInspectionAndPackingModal(false);
        toast.error("Uncaught error found");
      }
    });
  };

  // Opens the print modal for the packing note
  const printPNFunc = () => {
    if (props.invDetailsData.length === 0) {
      toast.warning("Please select the packing note for printing");
    } else {
      setPrintPNModal(true);
    }
  };

  return (
    <>
      <div>
        <div className="row col-md-12">
          <div className="d-flex flex-row justify-content-between">
            <button
              disabled={props.selectedReadyForPackingRows.length === 0}
              onClick={createDraftPNFunc}
              className={
                props.selectedReadyForPackingRows.length === 0
                  ? "button-style button-disabled m-1"
                  : "button-style m-1"
              }
            >
              Create Draft PN
            </button>
            <button
              disabled={selectedRegisterRow.DC_No}
              className={
                selectedRegisterRow.DC_No
                  ? "button-style button-disabled m-1"
                  : "button-style m-1"
              }
              onClick={printDraftPNFunc}
            >
              Print Draft PN
            </button>
            <button
              disabled={selectedRegisterRow.DC_No}
              className={
                selectedRegisterRow.DC_No
                  ? "button-style button-disabled m-1"
                  : "button-style m-1"
              }
              onClick={(e) => {
                if (!selectedRegisterRow.DC_Inv_No) {
                  toast.warning("Please select the draft PN for deleting");
                } else {
                  setConfirmationModalFor("Delete Draft PN");
                  setConfirmModalOpen(true);
                }
              }}
            >
              Delete Draft PN
            </button>
            <button
              disabled={selectedRegisterRow.DC_No}
              className={
                selectedRegisterRow.DC_No
                  ? "button-style button-disabled m-1"
                  : "button-style m-1"
              }
              onClick={saveDraftPNFunc}
            >
              Save Draft PN
            </button>
            <button
              disabled={selectedRegisterRow.DC_No}
              className={
                selectedRegisterRow.DC_No
                  ? "button-style button-disabled m-1"
                  : "button-style m-1"
              }
              onClick={(e) => {
                if (props.invDetailsData.length === 0) {
                  toast.warning("Please select the draft PN");
                } else {
                  getDCNo();
                  setConfirmationModalFor("Prepare PN");
                  setInspectionAndPackingModal(true);
                }
              }}
            >
              Prepare PN
            </button>
            <button
              disabled={!selectedRegisterRow.DC_No}
              className={
                !selectedRegisterRow.DC_No
                  ? "button-style button-disabled m-1"
                  : "button-style m-1"
              }
              onClick={printPNFunc}
            >
              Print PN
            </button>
            {selectedRegisterRow.DC_No ? (
              <Link
                to={`/PackingAndInvoices/PackingNote/Description`}
                state={selectedRegisterRow.DC_Inv_No}
              >
                <button className="button-style m-1">Open Invoice</button>
              </Link>
            ) : (
              <Link>
                <button className="button-style button-disabled m-1">
                  Open Invoice
                </button>
              </Link>
            )}
          </div>
        </div>
        <div className="p-1"></div>
        <div className="row">
          <div className="col-md-7 border-end">
            <div
              style={{
                height: "400px",
                overflow: "auto",
              }}
            >
              <FirstTable
                orderScheduleDetailsData={props.orderScheduleDetailsData}
                selectedReadyForPackingRows={props.selectedReadyForPackingRows}
                setSelectedReadyForPackingRows={
                  props.setSelectedReadyForPackingRows
                }
              />
            </div>
          </div>
          <div className="col-md-5">
            <div style={{ height: "190px", overflow: "auto" }}>
              <SecondTable
                invRegisterData={props.invRegisterData}
                setInvDetailsData={props.setInvDetailsData}
                allInvDetailsData={props.allInvDetailsData}
                invDetailsData={props.invDetailsData}
                setSelectedRegisterRow={setSelectedRegisterRow}
                selectedRegisterRow={selectedRegisterRow}
              />
            </div>
            <div className="p-2">
              <div className="border-bottom"></div>
            </div>
            <div style={{ height: "190px", overflow: "auto" }}>
              <ThirdTable
                orderScheduleDetailsData={props.orderScheduleDetailsData}
                allInvDetailsData={props.allInvDetailsData}
                setInvDetailsData={props.setInvDetailsData}
                invDetailsData={props.invDetailsData}
              />
            </div>
          </div>
        </div>
        <div className="p-2"></div>
      </div>
      <div>
        <ModalDraftPackingNote
          setPrintDraftPNModal={setPrintDraftPNModal}
          printDraftPNModal={printDraftPNModal}
          invRegisterData={selectedRegisterRow}
          invDetailsData={props.invDetailsData}
          invTaxData={[]}
          type={props.invRegisterData?.DC_InvType}
        />
        <ModalPackingNote
          setPrintCopyModal={setPrintPNModal}
          printCopyModal={printPNModal}
          invRegisterData={selectedRegisterRow}
          invDetailsData={props.invDetailsData}
          invTaxData={[]}
          type={props.invRegisterData?.DC_InvType}
        />
        <ConfirmationModal
          setConfirmModalOpen={setConfirmModalOpen}
          confirmModalOpen={confirmModalOpen}
          message={
            confirmationModalFor === "Delete Draft PN"
              ? `Are you sure to delete the draft PN`
              : confirmationModalFor === "Prepare PN"
              ? `Are you sure to prepare the PN`
              : "Error"
          }
          yesClickedFunc={
            confirmationModalFor === "Delete Draft PN"
              ? deleteDraftPNFunc
              : confirmationModalFor === "Prepare PN"
              ? preparePNFunc
              : "Error"
          }
        />
        <InspectionAndPacking
          setInspectionAndPackingModal={setInspectionAndPackingModal}
          InspectionAndPackingModal={InspectionAndPackingModal}
          setConfirmModalOpen={setConfirmModalOpen}
          setInsAndPack={props.setInsAndPack}
          insAndPack={props.insAndPack}
          headerData={props.headerData}
        />
      </div>
    </>
  );
}
