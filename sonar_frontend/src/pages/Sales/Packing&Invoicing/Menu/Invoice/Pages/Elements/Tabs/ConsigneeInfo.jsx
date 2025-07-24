import { Typeahead } from "react-bootstrap-typeahead";
import { toast } from "react-toastify";

// Displays and manages consignee/customer information for invoice
export default function ConsigneeInfo(props) {
  return (
    <>
      <div>
        <div className="row">
          <div className="d-flex col-md-6" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Select Customer
            </label>
            {props.invRegisterData.DC_No.length > 0 ? (
              <input
                value={props.invRegisterData.Cust_Name}
                disabled
                className="input-disabled"
              />
            ) : (
              <>
                <Typeahead
                  id="basic-example"
                  placeholder={
                    props.AllCust ? "Select the Customer" : "Loading..."
                  }
                  options={props.AllCust}
                  className={
                    props.AllCust ? "ip-select mt-1" : "input-disabled"
                  }
                  disabled={!props.AllCust}
                  onChange={(e) => {
                    if (e.length > 0) {
                      const arr =
                        props.AllCust[e[0]?.varID]?.State?.toLowerCase().split(
                          " "
                        );
                      for (var i = 0; i < arr?.length; i++) {
                        arr[i] =
                          arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
                      }
                      const newState = arr?.join(" ");
                      props.setInvRegisterData({
                        ...props.invRegisterData,
                        Cust_Code: props.AllCust[e[0]?.varID]?.Cust_Code,
                        Cust_Name: props.AllCust[e[0]?.varID]?.Cust_name,
                        Cust_Address: props.AllCust[e[0]?.varID]?.Address,
                        Cust_Place: props.AllCust[e[0]?.varID]?.City,
                        Cust_State:
                          props.allStates.filter(
                            (obj) => obj.State === newState
                          ).length === 0
                            ? "Others"
                            : newState,
                        Cust_StateId: props.AllCust[e[0]?.varID]?.StateId,
                        PIN_Code: props.AllCust[e[0]?.varID]?.Pin_Code,
                        Del_StateId: props.AllCust[e[0]?.varID]?.StateId,
                        GSTNo: props.AllCust[e[0]?.varID]?.GSTNo,
                        PAN_No: props.AllCust[e[0]?.varID]?.PAN_No,
                      });
                    } else {
                      props.setInvRegisterData({
                        ...props.invRegisterData,
                        Cust_Code: "",
                        Cust_Name: "",
                        Cust_Address: "",
                        Cust_Place: "",
                        Cust_State: "",
                        Cust_StateId: "",
                        PIN_Code: "",
                        GSTNo: "",
                        BillType: "",
                        PaymentTerms: "",
                      });
                    }
                  }}
                  onBlur={() => props.getTaxes()}
                />
              </>
            )}
          </div>
          <div className="d-flex col-md-6" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              PO No
            </label>
            <input
              name="PO_No"
              value={props.invRegisterData?.PO_No}
              autoComplete="off"
              onChange={(e) => {
                e.target.value = e.target.value || "";
                if (e.target.value?.length <= 90) {
                  props.inputHandler(e);
                } else {
                  toast.warning("PO No can be only 90 characters");
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
                  ? "input-disabled mt-1"
                  : "in-field mt-1"
              }
            />
          </div>
        </div>
        <div className="row">
          <div className="d-flex col-md-6" style={{ gap: "10px" }}>
            <label className="form-label">Address</label>
            <textarea
              rows="5"
              style={{ width: "100%", height: "100px" }}
              name="Cust_Address"
              value={props.invRegisterData?.Cust_Address}
              disabled
              className="input-disabled mt-2"
            ></textarea>
          </div>
          <div className="d-flex col-md-6" style={{ gap: "10px" }}>
            <label className="form-label">Delivery</label>
            <textarea
              rows="5"
              style={{ width: "100%", height: "100px" }}
              name="Del_Address"
              value={props.invRegisterData?.Del_Address || ""}
              onChange={(e) => {
                e.target.value = e.target.value || "";
                if (e.target.value?.length <= 150) {
                  props.inputHandler(e);
                } else {
                  toast.warning("Delivery address can be only 150 characters");
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
                  ? "input-disabled mt-2"
                  : "in-field mt-2"
              }
            ></textarea>
          </div>
        </div>
        <div className="row">
          <div className="d-flex col-md-3 mt-1" style={{ gap: "15px" }}>
            <label className="form-label">District</label>
            <input
              name="Cust_Place"
              value={props.invRegisterData?.Cust_Place}
              disabled
              className="input-disabled mt-1"
            />
          </div>
          <div className="d-flex col-md-3 mt-1" style={{ gap: "10px" }}>
            <label className="form-label">State</label>
            <input
              name="Cust_State"
              value={props.invRegisterData.Cust_State}
              disabled
              className="input-disabled mt-1"
            />
          </div>
          <div className="d-flex col-md-3 mt-1" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Pin Code
            </label>
            <input
              value={props.invRegisterData?.PIN_Code}
              name="PIN_Code"
              disabled
              className="input-disabled mt-1"
            />
          </div>
          <div className="d-flex col-md-3 mt-1" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              GST No
            </label>
            <input
              value={props.invRegisterData?.GSTNo}
              name="GSTNo"
              disabled
              className="input-disabled mt-1"
            />
          </div>
        </div>
      </div>
    </>
  );
}
