import { toast } from "react-toastify";

// Displays consignee and delivery information for packing note
export default function ConsigneeInfo(props) {
  return (
    <>
      <div>
        <div className="row">
          <div className="d-flex col-md-6" style={{ gap: "10px" }}>
            <label className="form-label">Address</label>
            <textarea
              rows="5"
              style={{ width: "100%", height: "120px" }}
              value={props.invRegisterData?.Cust_Address || ""}
              name="Cust_Address"
              disabled
              className="in-field mt-1"
            ></textarea>
          </div>
          <div className="d-flex col-md-6" style={{ gap: "10px" }}>
            <label className="form-label">Delivery</label>
            <textarea
              rows="5"
              maxLength={"199"}
              style={{ width: "100%", height: "120px" }}
              value={props.invRegisterData?.Del_Address || ""}
              name="Del_Address"
              onChange={(e) => {
                e.target.value = e.target.value || "";
                e.target.value = e.target.value;
                if (e.target.value?.length <= 150) {
                  props.inputHandler(e);
                } else {
                  toast.warning("Delivery address can be only 150 characters");
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
            ></textarea>
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-md-6 p-0">
            <div className="row ">
              <div className="d-flex col-md-4" style={{ gap: "10px" }}>
                <label className="form-label">District</label>
                <input
                  value={props.invRegisterData?.Cust_Place || ""}
                  name="Cust_Place"
                  disabled
                  className="in-field mt-1"
                />
              </div>
              <div className="d-flex col-md-4" style={{ gap: "10px" }}>
                <label className="form-label">State</label>
                <input
                  value={props.invRegisterData.Cust_State || ""}
                  disabled
                  className="in-field mt-1"
                />
              </div>
              <div className="d-flex col-md-4" style={{ gap: "10px" }}>
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                  Pin Code
                </label>
                <input
                  value={props.invRegisterData?.PIN_Code || ""}
                  name="PIN_Code"
                  disabled
                  className="in-field mt-1"
                />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="row">
              <div className="d-flex col-md-6" style={{ gap: "10px" }}>
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                  GST No
                </label>
                <input
                  value={props.invRegisterData?.GSTNo || ""}
                  disabled
                  className="in-field mt-1"
                />
              </div>
              <div className="d-flex col-md-6" style={{ gap: "10px" }}>
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                  GST State
                </label>
                <input
                  value={props.invRegisterData?.Cust_State || ""}
                  disabled
                  className="in-field"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <label>Schedule Intructions</label>
          <div className="col-md-12">
            <textarea
              id=""
              maxLength={"49"}
              style={{ width: "100%", height: "50px" }}
              name="Special_Instructions"
              value={
                props.invRegisterData.Special_Instructions ||
                "No Special Instructions"
              }
              onChange={(e) => {
                e.target.value = e.target.value || "";
                if (e.target.value?.length <= 40) {
                  props.inputHandler(e);
                } else {
                  toast.warning(
                    "Schedule Intructions can be only 40 characters"
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
                  : "in-field mt-1"
              }
            ></textarea>
          </div>
        </div>
      </div>
    </>
  );
}
