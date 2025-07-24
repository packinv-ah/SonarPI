import { toast } from "react-toastify";

export default function FormHeader(props) {
  return (
    <>
      <div>
        <div className="row">
          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Invoice Form:
            </label>
            <input
              value={props.invRegisterData?.DC_InvType}
              disabled
              className="in-field mt-1"
            />
          </div>
          <div className="d-flex col-md-4" style={{ gap: "33px" }}>
            <label className="form-label">Status</label>
            <input
              value={props.invRegisterData?.DCStatus}
              disabled
              className="in-field mt-1"
            />
          </div>
          <div className="col-md-4"></div>
        </div>

        <div className="row">
          <div className="d-flex col-md-4" style={{ gap: "25px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Invoice No
            </label>
            <input
              value={
                props.invRegisterData.Inv_No === "" ||
                props.invRegisterData.Inv_No === undefined ||
                props.invRegisterData.Inv_No === null
                  ? ""
                  : props.invRegisterData.Inv_No +
                    (props.invRegisterData?.Printable_Inv_Date
                      ? ` Date: ${props.invRegisterData?.Printable_Inv_Date}`
                      : "")
              }
              disabled
              className="in-field mt-1"
            />
          </div>
          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Order Ref.
            </label>
            <input
              value={props.invRegisterData?.OrderScheduleNo}
              disabled
              className="in-field mt-1"
            />
          </div>
          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              PO No.
            </label>
            <input
              maxLength={"101"}
              name="PO_No"
              autoComplete="off"
              value={props.invRegisterData?.PO_No || ""}
              onChange={(e) => {
                e.target.value = e.target.value || "";
                if (e.target.value?.length <= 100) {
                  props.inputHandler(e);
                } else {
                  toast.warning("PO No can be only 100 characters");
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
                  ? "in-field mt-1"
                  : "in-field mt-1"
              }
            ></input>
          </div>
        </div>

        <div className="row">
          <div className="d-flex col-md-4" style={{ gap: "45px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              PN No.
            </label>
            <input
              value={
                props.invRegisterData?.DC_No +
                (props.invRegisterData?.Printable_DC_Date
                  ? ` Date: ${props.invRegisterData?.Printable_DC_Date}`
                  : "")
              }
              disabled
              className="in-field mt-1"
            />
          </div>
          <div className="d-flex col-md-8" style={{ gap: "10px" }}>
            <label className="form-label">Consignee</label>
            <input
              value={props.invRegisterData?.Cust_Name}
              disabled
              className="in-field mt-1"
            />
          </div>
        </div>
      </div>
    </>
  );
}
