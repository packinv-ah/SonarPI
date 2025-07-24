import Axios from "axios";
import { toast } from "react-toastify";
import { apipoints } from "../../../../../../../api/PackInv_API/Invoice/Invoice";
import { localGST } from "../../../../../../../../Data/magodData";
import { validatedNum } from "../../../../../../../../utils/helpers";

// Displays and manages invoicing and delivery/payment info for invoice
export default function InvoicingInfo(props) {
  const trnsMode = ["By Road", "By Hand", "By Air", "By Courier"];
  const billType = ["Cash", "Credit"];
  const creditDays = [
    "7 Days Credit",
    "15 Days Credit",
    "30 Days Credit",
    "45 Days Credit",
    "60 Days Credit",
    "90 Days Credit",
  ];
  const cashMode = [
    "Cash on Delivery",
    "Cheque on Delivery",
    "Demand Draft on Delivery",
    "QR Code and RTGS",
  ];

  // Gets the next running DC number from backend
  const getDCNo = async () => {
    let finYear = `${
      (props.todayDate.getMonth() + 1 < 4
        ? props.todayDate.getFullYear() - 1
        : props.todayDate.getFullYear()
      )
        .toString()
        .slice(-2) +
      "/" +
      (props.todayDate.getMonth() + 1 < 4
        ? props.todayDate.getFullYear()
        : props.todayDate.getFullYear() + 1
      )
        .toString()
        .slice(-2)
    }`;

    const srlType = "GST_GoodsAndSerivce";
    const ResetPeriod = "FinanceYear";
    const ResetValue = 0;
    const Length = 4;

    Axios.post(apipoints.insertAndGetRunningNo, {
      finYear: finYear,
      unitName: props.formData.unitName,
      srlType: srlType,
      ResetPeriod: ResetPeriod,
      ResetValue: ResetValue,
      Length: Length,
    }).then((res) => {
      props.setRunningNoData(res.data.runningNoData);
    });
  };

  // Handles invoice creation workflow
  const createInvoiceWorkFunc = () => {
    getDCNo();
    props.setButtonClicked("Create Invoice");
    props.setConfirmModalOpen(true);
  };

  // Validates invoice fields before creation
  const createInvoiceValidationFunc = (e) => {
    const checkForZero = props.invDetailsData.filter(
      (obj) =>
        obj.Unit_Rate === 0 ||
        obj.Unit_Rate === 0.0 ||
        obj.Unit_Rate === "0" ||
        obj.Unit_Rate === "0.0" ||
        obj.Unit_Rate === "0.00" ||
        obj.Unit_Rate === null ||
        obj.Unit_Rate === "null" ||
        obj.Unit_Rate === "" ||
        obj.Qty === 0 ||
        obj.Qty === 0.0 ||
        obj.Qty === "0" ||
        obj.Qty === "0.0" ||
        obj.Qty === "0.00" ||
        obj.Qty === "null" ||
        obj.Qty === null ||
        obj.Qty === ""
    );

    if (checkForZero.length > 0) {
      toast.warning(
        "Check for zero value for quantity or rate, Correct and try again"
      );
      e.preventDefault();
    } else {
      if (
        props.invRegisterData.GSTNo !== localGST &&
        props.TaxDropDownData?.length > 0 &&
        props.invTaxData.length === 0
      ) {
        toast.warning("Please select SGST and CST for Tax");
        e.preventDefault();
      } else if (
        props.invRegisterData.Del_Address.length === 0 ||
        props.invRegisterData.Del_Address === null ||
        props.invRegisterData.Del_Address === "null" ||
        props.invRegisterData.Del_Address === undefined ||
        props.invRegisterData.Del_Address === "undefined" ||
        props.invRegisterData.Del_Address === ""
      ) {
        toast.warning("Please enter customer delivery address");
        e.preventDefault();
      } else if (
        props.invRegisterData.DespatchDate === null ||
        props.invRegisterData.DespatchDate === undefined ||
        props.invRegisterData.DespatchDate === "" ||
        props.invRegisterData.DespatchDate === "null" ||
        props.invRegisterData.DespatchDate === "undefined" ||
        props.invRegisterData.DespatchDate.length === 0
      ) {
        toast.warning("Please enter Dispatch Date");
        e.preventDefault();
      } else if (
        props.invRegisterData.TptMode === null ||
        props.invRegisterData.TptMode === undefined ||
        props.invRegisterData.TptMode === "" ||
        props.invRegisterData.TptMode === "null" ||
        props.invRegisterData.TptMode === "undefined" ||
        props.invRegisterData.TptMode.length === 0
      ) {
        toast.warning("Please select Dispatch Mode");
        e.preventDefault();
      } else if (
        props.invRegisterData.TptMode === "By Road" &&
        (props.invRegisterData.VehNo === null ||
          props.invRegisterData.VehNo === undefined ||
          props.invRegisterData.VehNo === "" ||
          props.invRegisterData.VehNo === "null" ||
          props.invRegisterData.VehNo === "undefined" ||
          props.invRegisterData.VehNo.length === 0)
      ) {
        toast.warning("Please enter Vehicle Number");
        e.preventDefault();
      } else if (
        (props.invRegisterData.Del_ContactName === null ||
          props.invRegisterData.Del_ContactName === undefined ||
          props.invRegisterData.Del_ContactName === "" ||
          props.invRegisterData.Del_ContactName === "null" ||
          props.invRegisterData.Del_ContactName === "undefined" ||
          props.invRegisterData.Del_ContactName.length === 0) &&
        props.invRegisterData.DC_InvType === "Services"
      ) {
        toast.warning("Please enter delivery person name");
        e.preventDefault();
      } else if (
        (props.invRegisterData.Del_ContactNo === null ||
          props.invRegisterData.Del_ContactNo === undefined ||
          props.invRegisterData.Del_ContactNo === "" ||
          props.invRegisterData.Del_ContactNo === "null" ||
          props.invRegisterData.Del_ContactNo.length === 0) &&
        props.invRegisterData.DC_InvType === "Services"
      ) {
        toast.warning("Please enter delivery person conatct number");
        e.preventDefault();
      } else if (
        props.invRegisterData?.BillType === "Cash" &&
        props.invRegisterData.PaymentTerms.length === 0
      ) {
        toast.warning("Please select the Cash Mode");
        e.preventDefault();
      } else if (
        props.invRegisterData?.BillType === "Credit" &&
        props.invRegisterData.PaymentTerms.length === 0
      ) {
        toast.warning("Please select the Credit Days");
        e.preventDefault();
      } else if (props.invRegisterData.BillType.length === 0) {
        toast.warning("Please select Bill Type");
        e.preventDefault();
      } else if (
        parseFloat(props.invRegisterData.GrandTotal).toFixed(2) < 0.0
      ) {
        toast.warning("Can't create the invoice with negative amount");
        e.preventDefault();
      } else if (props.invRegisterData.BillType.length > 0) {
        if (props.invRegisterData.BillType === "Cash") {
          if (
            props.invRegisterData.PaymentTerms === cashMode[0] ||
            props.invRegisterData.PaymentTerms === cashMode[3]
          ) {
            if (
              props.invRegisterData.PaymentReceiptDetails === null ||
              props.invRegisterData.PaymentReceiptDetails === undefined ||
              props.invRegisterData.PaymentReceiptDetails === "" ||
              props.invRegisterData.PaymentReceiptDetails === "null" ||
              props.invRegisterData.PaymentReceiptDetails.length < 8 ||
              props.invRegisterData.PymtAmtRecd.length === 0 ||
              parseFloat(props.invRegisterData.PymtAmtRecd).toFixed(1) === 0.0
            ) {
              toast.warning("Please enter the Cash Reciept No and Details");
              e.preventDefault();
            } else {
              if (
                parseFloat(props.invRegisterData.PymtAmtRecd).toFixed(2) <
                parseFloat(props.invRegisterData.GrandTotal).toFixed(2)
              ) {
                toast.warning("Amount collected is less then Invoice Amount");
                e.preventDefault();
              } else {
                createInvoiceWorkFunc();
              }
            }
          } else if (props.invRegisterData.PaymentTerms === cashMode[1]) {
            if (
              props.invRegisterData.PaymentReceiptDetails === null ||
              props.invRegisterData.PaymentReceiptDetails === undefined ||
              props.invRegisterData.PaymentReceiptDetails === "" ||
              props.invRegisterData.PaymentReceiptDetails === "null" ||
              props.invRegisterData.PaymentReceiptDetails.length < 8 ||
              props.invRegisterData.PymtAmtRecd.length === 0 ||
              parseFloat(props.invRegisterData.PymtAmtRecd).toFixed(1) === 0.0
            ) {
              toast.warning("Please enter the Cheque Details");
              e.preventDefault();
            } else {
              if (
                parseFloat(props.invRegisterData.PymtAmtRecd) <
                parseFloat(props.invRegisterData.GrandTotal)
              ) {
                toast.warning("Amount collected is less then Invoice Amount");
                e.preventDefault();
              } else {
                createInvoiceWorkFunc();
              }
            }
          } else if (props.invRegisterData.PaymentTerms === cashMode[2]) {
            if (
              props.invRegisterData.PaymentReceiptDetails === null ||
              props.invRegisterData.PaymentReceiptDetails === undefined ||
              props.invRegisterData.PaymentReceiptDetails === "" ||
              props.invRegisterData.PaymentReceiptDetails === "null" ||
              props.invRegisterData.PaymentReceiptDetails.length < 8 ||
              props.invRegisterData.PymtAmtRecd.length === 0 ||
              parseFloat(props.invRegisterData.PymtAmtRecd).toFixed(1) === 0.0
            ) {
              toast.warning("Please enter the DD Details");
              e.preventDefault();
            } else {
              if (
                parseFloat(props.invRegisterData.PymtAmtRecd).toFixed(2) <
                parseFloat(props.invRegisterData.GrandTotal).toFixed(2)
              ) {
                toast.warning("Amount collected is less then Invoice Amount");
                e.preventDefault();
              } else {
                createInvoiceWorkFunc();
              }
            }
          } else {
            toast.warning("Please select the cash mode / credit days");
            e.preventDefault();
          }
        } else {
          createInvoiceWorkFunc();
        }
      } else {
        createInvoiceWorkFunc();
      }
    }
  };

  // Validates number input fields
  const numbValidations = (e) => {
    if (
      e.which === 38 ||
      e.which === 40 ||
      ["e", "E", "+", "-"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  return (
    <>
      <div>
        <div className="row">
          <div className="col-md-7">
            <div className="col">
              <div>
                <label className="form-label">Dispatch Details</label>
                <div
                  className="p-1 row pb-2"
                  style={{ border: "1px solid lightgray", borderRadius: "5px" }}
                >
                  <div className="d-flex col-md-4" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Dispatch Date
                    </label>
                    <input
                      type="datetime-local"
                      name="DespatchDate"
                      value={props.invRegisterData?.DespatchDate || ""}
                      min={props.formatedTodayDate}
                      onChange={props.inputHandler}
                      disabled={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled"
                          : "in-field"
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className=" d-flex col-md-4" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Dispatch Mode
                    </label>
                    <select
                      name="TptMode"
                      value={props.invRegisterData?.TptMode}
                      onChange={props.inputHandler}
                      disabled={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "ip-select input-disabled"
                          : "ip-select"
                      }
                    >
                      <option value="" selected disabled hidden>
                        Select Dispatch Mode
                      </option>
                      {trnsMode.map((val, key) => (
                        <option value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex col-md-4" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Vehicle No
                    </label>
                    <input
                      type="text"
                      name="VehNo"
                      value={props.invRegisterData?.VehNo}
                      onChange={(e) => {
                        e.target.value = e.target.value || "";
                        if (e.target.value?.length <= 45) {
                          props.inputHandler(e);
                        } else {
                          toast.warning(
                            "Vehicle Number can be only 45 characters"
                          );
                          e.preventDefault();
                        }
                      }}
                      disabled={
                        props.invRegisterData?.TptMode === "By Hand" ||
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData?.TptMode === "By Hand" ||
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled"
                          : "in-field"
                      }
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="form-label">Invoice Summary</label>
                <div
                  className="p-1 row pb-2"
                  style={{ border: "1px solid lightgray", borderRadius: "5px" }}
                >
                  <div className="d-flex col-md-4" style={{ gap: "25px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Net Total
                    </label>
                    <input
                      disabled
                      className="input-disabled"
                      name="Net_Total"
                      value={validatedNum(props.invRegisterData?.Net_Total)}
                      onChange={props.inputHandler}
                    />
                  </div>
                  <div className="d-flex col-md-4" style={{ gap: "30px" }}>
                    <label className="form-label">Discount</label>
                    <input
                      type="number"
                      name="Discount"
                      placeholder="0.00"
                      value={props.invRegisterData?.Discount}
                      onKeyDown={numbValidations}
                      onChange={(e) => {
                        e.target.value = e.target.value || "";
                        if (parseInt(e.target.value) < 0) {
                          e.target.value = parseInt(e.target.value) * -1;
                          toast.warning("Discount can't be negative");
                          props.handleChangeDiscountDelivery(e);
                        } else if (
                          parseFloat(props.invRegisterData.Net_Total) +
                            parseFloat(props.invRegisterData.Del_Chg) <
                          parseFloat(e.target.value)
                        ) {
                          toast.warning(
                            "Discount can't be greater then Net Total + Delivery Charges"
                          );
                          e.preventDefault();
                        } else {
                          props.handleChangeDiscountDelivery(e);
                        }
                      }}
                      disabled={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled"
                          : "in-field"
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className=" d-flex col-md-4" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Delivery Charges
                    </label>
                    <input
                      type="number"
                      name="Del_Chg"
                      placeholder="0.00"
                      value={props.invRegisterData?.Del_Chg}
                      onKeyDown={numbValidations}
                      onChange={(e) => {
                        if (parseInt(e.target.value) < 0) {
                          e.target.value = parseInt(e.target.value) * -1;
                          toast.warning("Delivery Charge can't be negative");
                          props.handleChangeDiscountDelivery(e);
                        } else {
                          props.handleChangeDiscountDelivery(e);
                        }
                      }}
                      disabled={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled"
                          : "in-field"
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="d-flex col-md-4" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Tax Amount
                    </label>
                    <input
                      disabled
                      className="input-disabled"
                      name="TaxAmount"
                      value={parseFloat(
                        props.invRegisterData?.TaxAmount
                      ).toFixed(2)}
                      onChange={props.inputHandler}
                    />
                  </div>
                  <div className="d-flex col-md-4" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Invoice Total
                    </label>
                    <input
                      disabled
                      className="input-disabled"
                      name="InvTotal"
                      value={validatedNum(props.invRegisterData?.InvTotal)}
                      onChange={props.inputHandler}
                    />
                  </div>
                  <div className="d-flex col-md-4" style={{ gap: "45px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Round Off
                    </label>
                    <input
                      disabled
                      className="input-disabled"
                      name="Round_Off"
                      value={validatedNum(props.invRegisterData?.Round_Off)}
                      onChange={props.inputHandler}
                    />
                  </div>
                  <div className="d-flex col-md-4" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Grand Total
                    </label>
                    <input
                      disabled
                      className="input-disabled"
                      name="GrandTotal"
                      value={validatedNum(props.invRegisterData?.GrandTotal)}
                      onChange={props.inputHandler}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="form-label">Remarks</label>
                <textarea
                  style={{
                    border: "1px solid lightgray",
                    borderRadius: "5px",
                    width: "100%",
                    height: "50px",
                  }}
                  name="Remarks"
                  value={props.invRegisterData?.Remarks}
                  onChange={(e) => {
                    e.target.value = e.target.value || "";
                    if (e.target.value?.length <= 150) {
                      props.inputHandler(e);
                    } else {
                      toast.warning("Remarks can be only 150 characters");
                      e.preventDefault();
                    }
                  }}
                  disabled={
                    props.invRegisterData.Inv_No?.length > 0 ||
                    props.invRegisterData.DCStatus === "Cancelled"
                  }
                  className={
                    props.invRegisterData.Inv_No?.length > 0 ||
                    props.invRegisterData.DCStatus === "Cancelled"
                      ? "input-disabled p-1 pb-2"
                      : "in-field p-1 pb-2"
                  }
                ></textarea>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <div>
              <label className="form-label">Delivery Details</label>
              <div
                className="p-1 pb-2"
                style={{ border: "1px solid lightgray", borderRadius: "5px" }}
              >
                <div className="row">
                  <div className="d-flex col-md-6" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Person Name
                    </label>
                    <input
                      name="Del_ContactName"
                      value={props.invRegisterData.Del_ContactName}
                      onChange={(e) => {
                        e.target.value = e.target.value || "";
                        if (e.target.value?.length <= 90) {
                          props.inputHandler(e);
                        } else {
                          toast.warning(
                            "Delivery Person Name can be only 90 characters"
                          );
                          e.preventDefault();
                        }
                      }}
                      disabled={
                        props.invRegisterData.Inv_No ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled"
                          : "in-field"
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="d-flex col-md-6" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Person Contact No
                    </label>
                    <input
                      name="Del_ContactNo"
                      value={props.invRegisterData.Del_ContactNo}
                      onChange={(e) => {
                        e.target.value = e.target.value || "";
                        if (e.target.value?.length <= 50) {
                          props.inputHandler(e);
                        } else {
                          toast.warning(
                            "Delivery Person Contact Number can be only 50 characters"
                          );
                          e.preventDefault();
                        }
                      }}
                      disabled={
                        props.invRegisterData.Inv_No ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled"
                          : "in-field"
                      }
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="form-label">Payment Details</label>
              <div
                className="p-1 pb-2"
                style={{ border: "1px solid lightgray", borderRadius: "5px" }}
              >
                <div className="row">
                  <div className="d-flex col-md-6" style={{ gap: "28px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Bill Type
                    </label>
                    <select
                      name="BillType"
                      value={props.invRegisterData.BillType}
                      onChange={(e) => {
                        let newInvRegister = props.invRegisterData;
                        if (e.target.value === "Cash") {
                          newInvRegister.PaymentTerms = cashMode[0];
                        } else {
                          newInvRegister.PaymentTerms = creditDays[2];
                        }
                        props.setInvRegisterData(newInvRegister);
                        props.inputHandler(e);
                      }}
                      disabled={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled ip-select"
                          : "ip-select"
                      }
                    >
                      <option value="" selected disabled hidden>
                        Select Bill Type
                      </option>
                      {billType.map((val, key) => (
                        <option value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex col-md-6" style={{ gap: "45px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {props.invRegisterData?.BillType === "Cash"
                        ? "Cash Mode"
                        : "Credit Days"}
                    </label>
                    <select
                      name="PaymentTerms"
                      value={props.invRegisterData?.PaymentTerms || ""}
                      onChange={props.inputHandler}
                      disabled={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled ip-select"
                          : "ip-select"
                      }
                    >
                      <option value="" selected disabled hidden>
                        {props.invRegisterData?.BillType === "Cash"
                          ? "Select Cash Mode"
                          : "Select Credit Days"}
                      </option>
                      {(props.invRegisterData?.BillType === "Cash"
                        ? cashMode
                        : creditDays
                      ).map((val, key) => (
                        <option value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex col-md-6 mt-1" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Grand Total
                    </label>
                    <input
                      disabled
                      className="input-disabled"
                      name="GrandTotal"
                      value={validatedNum(props.invRegisterData?.GrandTotal)}
                      onChange={props.inputHandler}
                    />
                  </div>
                  <div className="d-flex col-md-6 mt-1" style={{ gap: "10px" }}>
                    <label
                      className="form-label"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Amount Recieved
                    </label>
                    <input
                      type="number"
                      name="PymtAmtRecd"
                      value={props.invRegisterData?.PymtAmtRecd}
                      onKeyDown={numbValidations}
                      placeholder="0.00"
                      onChange={(e) => {
                        if (parseInt(e.target.value) < 0) {
                          e.target.value = parseInt(e.target.value) * -1;
                          toast.warning("Amount Recieved can't be negative");
                          props.inputHandler(e);
                        } else {
                          props.inputHandler(e);
                        }
                      }}
                      disabled={
                        props.invRegisterData?.BillType === "Credit" ||
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData?.BillType === "Credit" ||
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled"
                          : "in-field"
                      }
                      autoComplete="off"
                    />
                  </div>
                  {props.invRegisterData?.BillType === "Cash" ? (
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        rows="4"
                        style={{
                          border: "1px solid lightgray",
                          borderRadius: "5px",
                          width: "100%",
                        }}
                        name="PaymentReceiptDetails"
                        value={props.invRegisterData?.PaymentReceiptDetails}
                        onChange={(e) => {
                          e.target.value = e.target.value || "";
                          if (e.target.value?.length <= 40) {
                            props.inputHandler(e);
                          } else {
                            toast.warning(
                              "Description can be only 40 characters"
                            );
                            e.preventDefault();
                          }
                        }}
                        disabled={
                          props.invRegisterData.Inv_No?.length > 0 ||
                          props.invRegisterData.DCStatus === "Cancelled"
                        }
                        className={
                          props.invRegisterData.Inv_No?.length > 0 ||
                          props.invRegisterData.DCStatus === "Cancelled"
                            ? "input-disabled"
                            : ""
                        }
                      ></textarea>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <button
              disabled={
                !(props.invRegisterData.DC_No.length > 0) ||
                props.invRegisterData.Inv_No?.length > 0 ||
                props.invRegisterData.DCStatus === "Cancelled"
              }
              className={
                !(props.invRegisterData.DC_No.length > 0) ||
                props.invRegisterData.Inv_No?.length > 0 ||
                props.invRegisterData.DCStatus === "Cancelled"
                  ? "button-style button-disabled"
                  : "button-style"
              }
              onClick={createInvoiceValidationFunc}
            >
              Create Invoice
            </button>
          </div>
          <div className="col-md-6 p-0">
            <div className="d-flex justify-content-end">
              <button
                disabled={
                  !(props.invRegisterData.Inv_No?.length > 0) ||
                  props.invRegisterData.DCStatus === "Cancelled"
                }
                className={
                  !(props.invRegisterData.Inv_No?.length > 0) ||
                  props.invRegisterData.DCStatus === "Cancelled"
                    ? "button-style button-disabled"
                    : "button-style"
                }
                onClick={
                  props.invDetailsData?.length > props.rowLimit
                    ? props.printAnnexure
                    : props.printInvoice
                }
              >
                {props.invDetailsData?.length > props.rowLimit
                  ? "Print Annexure"
                  : "Print Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
