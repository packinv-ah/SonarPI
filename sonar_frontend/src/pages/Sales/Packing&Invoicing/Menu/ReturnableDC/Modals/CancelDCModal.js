import { Modal } from "react-bootstrap";

function CancelDCModal({ cancelDC, closeCancelDC, handleDCCancel }) {
  return (
    <Modal show={cancelDC} onHide={closeCancelDC} size="md">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "14px" }}>
          Magod ReturnableDC
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ fontSize: "12px" }}>
        Do you wish to cancel the Returnable DC?
      </Modal.Body>
      <Modal.Footer>
        <button
          className="button-style"
          style={{ width: "50px" }}
          onClick={handleDCCancel}
        >
          Yes
        </button>

        <button
          className="button-style"
          style={{ width: "50px", backgroundColor: "rgb(173, 173, 173)" }}
          onClick={closeCancelDC}
        >
          No
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default CancelDCModal;
