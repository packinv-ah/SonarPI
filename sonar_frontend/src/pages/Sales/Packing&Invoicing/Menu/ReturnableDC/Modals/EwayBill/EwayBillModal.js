import { Modal } from "react-bootstrap";

function EwayBillModal({
  ewayBill,
  closeEwayBill,
  handleInputChange,
  formData,
  openEwayBillSave,
}) {
  return (
    <Modal show={ewayBill} onHide={closeEwayBill} size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "14px" }}>E Way Bill</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <b>
            <h5>
              <span
                style={{
                  background: "#2b3a55",
                  color: "white",
                  width: "auto",
                  whiteSpace: "nowrap",
                  padding: "1.5px",
                  fontSize: "14px",
                }}
              >
                {formData.gstNo}
              </span>{" "}
              <span
                style={{
                  background: "#2b3a55",
                  color: "white",
                  width: "auto",
                  whiteSpace: "nowrap",
                  padding: "1.5px",
                  marginLeft: "2%",
                  fontSize: "14px",
                }}
              >
                {formData.custName}
              </span>
            </h5>
          </b>
        </div>

        <div className="row">
          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Inv/DC No
            </label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.dcType}
            />
          </div>

          <div className="col-md-4">
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.dcNo}
            />
          </div>

          <div className="col-md-4">
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.dcDate}
            />
          </div>
        </div>

        <div className="row mt-1">
          <div className="d-flex col-md-4" style={{ gap: "40px" }}>
            <label className="form-label">Place</label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.custCity}
            />
          </div>

          <div className="col-md-4">
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.custState}
            />
          </div>

          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label">Transport</label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.vehicleDetails}
            />
          </div>
        </div>
        <div className="row mt-1">
          <div className="d-flex" style={{ gap: "20px" }}>
            <label className="form-label">Delivery</label>
            <textarea
              className="in-field mt-2"
              rows="3"
              name="deliveryAddress"
              style={{
                width: "100%",
                padding: "5px",
                backgroundColor: "white",
                height: "80px",
              }}
              value={formData.deliveryAddress}
              disabled
            ></textarea>
          </div>
        </div>

        <div className="row mt-1">
          <div className="d-flex col-md-4" style={{ gap: "35px" }}>
            <label className="form-label">Value</label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.taxableAmount}
            />
          </div>

          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label">Tax</label>
            <input
              className="in-field mt-1"
              type="text"
              disabled
              value={formData.taxAmt}
            />
          </div>

          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
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
        </div>
      </Modal.Body>
      <Modal.Footer className="row justify-content-center mt-3">
        <button
          className="button-style "
          style={{ width: "80px" }}
          onClick={openEwayBillSave}
        >
          Save
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default EwayBillModal;
