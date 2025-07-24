import React, { useEffect } from "react";
import Modal from "react-bootstrap/Modal";

// InspectionAndPacking function
export default function InspectionAndPacking(props) {
  useEffect(() => {
    props.setInsAndPack({
      inspectedBy: props.headerData?.SalesContact,
      packedBy: props.headerData?.Inspected_By,
    });
  }, [props.InspectionAndPackingModal]);

  // closeModal function
  const closeModal = () => {
    props.setInspectionAndPackingModal(false);
  };

  // yesClicked function
  const yesClicked = () => {
    props.setConfirmModalOpen(true);
  };

  // changeInputs function
  const changeInputs = (e) => {
    props.setInsAndPack({
      ...props.insAndPack,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Modal
        show={props.InspectionAndPackingModal}
        onHide={closeModal}
        style={{ background: "#4d4d4d57" }}
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "14px" }}>
            Inspection and Packing Form
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form action="">
            <div className="row">
              <label className="form-label col-md-4 m-0">Inspected by</label>
              <div className="col-md-7">
                <input
                  className="in-field"
                  autoComplete="off"
                  value={props.insAndPack?.inspectedBy || ""}
                  name="inspectedBy"
                  onChange={changeInputs}
                />
              </div>
            </div>
            <div className="p-1"></div>
            <div className="row">
              <label className="form-label col-md-4 m-0">Packed by</label>
              <div className="col-md-7">
                <input
                  className="in-field"
                  autoComplete="off"
                  value={props.insAndPack?.packedBy || ""}
                  name="packedBy"
                  onChange={changeInputs}
                />{" "}
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="d-flex flex-row justify-content-end">
          <button
            disabled={
              props.insAndPack.inspectedBy === undefined ||
              props.insAndPack.inspectedBy === null ||
              props.insAndPack.inspectedBy === "" ||
              props.insAndPack.packedBy === undefined ||
              props.insAndPack.packedBy === null ||
              props.insAndPack.packedBy === ""
            }
            className={
              props.insAndPack.inspectedBy === undefined ||
              props.insAndPack.inspectedBy === null ||
              props.insAndPack.inspectedBy === "" ||
              props.insAndPack.packedBy === undefined ||
              props.insAndPack.packedBy === null ||
              props.insAndPack.packedBy === ""
                ? "button-style button-disabled m-0 me-3"
                : "button-style m-0 me-3"
            }
            style={{ width: "60px" }}
            onClick={yesClicked}
          >
            Ok
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
