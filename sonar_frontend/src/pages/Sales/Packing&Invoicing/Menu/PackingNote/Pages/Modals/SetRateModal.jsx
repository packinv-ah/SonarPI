import Modal from "react-bootstrap/Modal";
import { Table } from "react-bootstrap";
import { toast } from "react-toastify";
import Axios from "axios";
import { apipoints } from "../../../../../../api/PackInv_API/PackingNote/PackingNote";

// Displays and manages the modal for setting rates on invoice details
export default function SetRateModal(props) {
  // Closes the modal and refreshes data
  const closeModal = () => {
    props.fetchData();
    props.setShowSetRateModal(false);
  };

  // Handles input changes for job work and material rates
  const onChangeInput = (key, JW_Rate, Mtrl_rate) => {
    let arr = [];
    for (let i = 0; i < props.invDetailsData.length; i++) {
      const element = props.invDetailsData[i];
      if (i === key) {
        element.JW_Rate = parseFloat(JW_Rate || "");
        element.Mtrl_rate = parseFloat(Mtrl_rate || "");
        element.Unit_Rate =
          parseFloat(JW_Rate || 0) + parseFloat(Mtrl_rate || 0);
      }
      arr.push(element);
    }
    props.setInvDetailsData(arr);
  };

  // Updates the rates and invoice register data
  const updatingTheRateFunction = () => {
    let newInvRegister = props.invRegisterData || {};

    Axios.post(apipoints.updateRatesPN, {
      newRates: props.invDetailsData,
    }).then((res) => {
      if (res.data) {
        toast.success("Set Rate Successful");

        let newNetTotal = 0;
        let newRoundOff = 0;
        let newGrandTotal = 0;

        for (let i = 0; i < props.invDetailsData.length; i++) {
          const element = props.invDetailsData[i];
          newNetTotal =
            newNetTotal +
            parseFloat(element.Qty) *
              (parseFloat(element.JW_Rate || 0) +
                parseFloat(element.Mtrl_rate || 0));
        }

        newGrandTotal = Math.round(newNetTotal);
        newRoundOff = parseFloat(newGrandTotal) - parseFloat(newNetTotal);

        newInvRegister.Net_Total = newNetTotal.toFixed(2);
        newInvRegister.Discount = (0).toFixed(2);
        newInvRegister.Del_Chg = (0).toFixed(2);
        newInvRegister.TaxAmount = (0).toFixed(2);
        newInvRegister.InvTotal = newNetTotal.toFixed(2);
        newInvRegister.Round_Off = newRoundOff.toFixed(2);
        newInvRegister.GrandTotal = newGrandTotal.toFixed(2);

        Axios.post(apipoints.updatePNProfileData, {
          invRegisterData: newInvRegister,
          invTaxData: [],
        }).then((res) => {
          if (res) {
            if (res.data.status === 1) {
              document.getElementById("taxDropdown").value = "none";
              toast.success(res.data.comment);
              closeModal();
            } else if (res.data.status === 0) {
              toast.error(res.data.comment);
            } else {
              toast.error("Uncaught Error");
            }
          }
        });
      } else {
        toast.warning("Backend Error");
      }
    });
  };

  // Prevents invalid number input in rate fields
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
      <Modal
        size="lg"
        show={props.showSetRateModal}
        onHide={closeModal}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title
            id="example-custom-modal-styling-title"
            style={{ fontSize: "14px" }}
          >
            Set Rates
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="d-flex col-md-4" style={{ gap: "30px" }}>
              <label className="form-label">Customer</label>
              <input
                type="text"
                defaultValue={props.setRateConsumerData[0]?.Cust_Name}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="d-flex col-md-4" style={{ gap: "15px" }}>
              <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                Sales Contact
              </label>
              <input
                type="text"
                defaultValue={props.setRateConsumerData[0]?.SalesContact}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="d-flex col-md-4" style={{ gap: "60px" }}>
              <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                PO No.
              </label>
              <input
                type="text"
                defaultValue={props.setRateConsumerData[0]?.PO_No}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="d-flex col-md-4" style={{ gap: "10px" }}>
              <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                Schedule No.
              </label>
              <input
                type="text"
                defaultValue={props.setRateConsumerData[0]?.ScheduleId}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="d-flex col-md-4" style={{ gap: "10px" }}>
              <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                Schedule Type
              </label>
              <input
                type="text"
                defaultValue={props.setRateConsumerData[0]?.ScheduleType}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="d-flex col-md-4" style={{ gap: "10px" }}>
              <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                Schedule Status
              </label>
              <input
                type="text"
                defaultValue={props.setRateConsumerData[0]?.Schedule_Status}
                disabled
                className="input-disabled"
              />
            </div>
          </div>
          <div className="border-top m-3"></div>
          <div>
            <Table
              striped
              className="table-data border"
              style={{ border: "1px" }}
            >
              <thead className="tableHeaderBGColor">
                <tr>
                  <th>SL No</th>
                  <th>Drawing Name</th>
                  <th>Material</th>
                  <th>Job Work Cost</th>
                  <th>Material Cost</th>
                </tr>
              </thead>
              <tbody className="tablebody">
                {props.invDetailsData.map((val, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{val.Dwg_No}</td>
                    <td>{val.Mtrl}</td>
                    <td>
                      <input
                        type="number"
                        className="border-0"
                        value={val.JW_Rate}
                        placeholder="0.00"
                        onKeyDown={numbValidations}
                        onChange={(e) => {
                          e.target.value = e.target.value || "";
                          if (parseInt(e.target.value) < 0) {
                            e.target.value = parseInt(e.target.value) * -1;
                            toast.warning("Job Work Cost can't be negative");
                          }
                          onChangeInput(i, e.target.value, val.Mtrl_rate);
                        }}
                        style={{ background: "transparent" }}
                        autoComplete="off"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={val.Mtrl_rate}
                        onKeyDown={numbValidations}
                        placeholder="0.00"
                        onChange={(e) => {
                          e.target.value = e.target.value || "";
                          if (parseInt(e.target.value) < 0) {
                            e.target.value = parseInt(e.target.value) * -1;
                            toast.warning("Material Cost can't be negative");
                          }
                          onChangeInput(i, val.JW_Rate, e.target.value);
                        }}
                        disabled={
                          props.invRegisterData?.DC_InvType === "Job Work" ||
                          props.setRateConsumerData[0]?.ScheduleType ===
                            "Service"
                        }
                        className={
                          props.invRegisterData?.DC_InvType === "Job Work" ||
                          props.setRateConsumerData[0]?.ScheduleType ===
                            "Service"
                            ? "border-0 input-disabled"
                            : "border-0"
                        }
                        style={{ background: "transparent" }}
                        autoComplete="off"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="" style={{ float: "right" }}>
            <button className="button-style" onClick={updatingTheRateFunction}>
              Save
            </button>
            <button className="button-style" onClick={closeModal}>
              Close
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
