export default function FormHeader(props) {
  return (
    <>
      <div>
        <div className="row">
          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Invoice Form
            </label>
            <input
              value={props.invRegisterData?.DC_InvType}
              disabled
              className="input-disabled mt-1"
            />
          </div>
          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Invoice No
            </label>
            <input
              value={
                props.invRegisterData.Inv_No?.length > 0
                  ? `${props.invRegisterData.Inv_No} Date: ${props.invRegisterData.Inv_Date}`
                  : ""
              }
              disabled
              className="input-disabled mt-1"
            />
          </div>

          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label">Status</label>
            <input
              value={props.invRegisterData?.DCStatus}
              disabled
              className="input-disabled mt-1"
            />
          </div>
          <div className="d-flex col-md-4 mt-1" style={{ gap: "45px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              PN No
            </label>
            <input
              value={
                props.invRegisterData.DC_No.length > 0
                  ? `${props.invRegisterData.DC_No} Date: ${props.invRegisterData.DC_Date}`
                  : "Draft"
              }
              disabled
              className="input-disabled mt-1"
            />
          </div>
          <div className="d-flex col-md-8 mt-1" style={{ gap: "10px" }}>
            <label className="form-label">Consignee</label>
            <input
              value={props.invRegisterData?.Cust_Name}
              disabled
              className="input-disabled mt-1"
            />
          </div>
        </div>
      </div>
    </>
  );
}
