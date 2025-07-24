import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import Axios from "axios";
import { apipoints } from "../../../../../../api/PackInv_API/Inspection/InspProfi";

// Modal for Yes/No confirmation actions
export default function YesNoModal(props) {
  const {
    setSmShow,
    onOkButtonClick,
    onHide,
    actionType,
    orderScheduleDetailsData,
    setOrderScheduleDetailsData,
    selectedScheduleDetailsRows,
    setSelectedScheduleDetailsRows,
  } = props;

  // Handles OK button click and updates schedule details
  const handleOkClick = () => {
    if (actionType === "clear") {
      const updatedPartListData = [...orderScheduleDetailsData];

      updatedPartListData.forEach((row) => {
        if (
          selectedScheduleDetailsRows?.some(
            (item) => item.SchDetailsID === row.SchDetailsID
          )
        ) {
          row.QtyCleared = row.QtyProduced - row.QtyRejected;
        }
      });
      Axios.post(apipoints.updateSchDetails, updatedPartListData)
        .then((res) => {
          const totalQtyCleared = updatedPartListData.reduce((total, row) => {
            if (selectedScheduleDetailsRows?.includes(row.SchDetailsID)) {
              return total + row.QtyCleared;
            }
            return total;
          }, 0);
          toast.success(`Parts cleared and Saved Successfully`);
          setOrderScheduleDetailsData(updatedPartListData);
          setSelectedScheduleDetailsRows([]);
        })
        .catch((error) => {
          toast.error("An error occurred while saving data.");
        });
    } else if (actionType === "reset") {
      const updatedPartListData = [...orderScheduleDetailsData];
      updatedPartListData.forEach((row) => {
        if (
          selectedScheduleDetailsRows?.some(
            (item) => item.SchDetailsID === row.SchDetailsID
          )
        ) {
          row.QtyCleared = 0;
        }
      });
      Axios.post(apipoints.updateSchDetails, updatedPartListData)
        .then((res) => {
          const totalQtyCleared = updatedPartListData.reduce((total, row) => {
            if (selectedScheduleDetailsRows?.includes(row.SchDetailsID)) {
              return total + row.QtyCleared;
            }
            return total;
          }, 0);
          toast.success(`Parts Reset and Saved Successfully`);
          setOrderScheduleDetailsData(updatedPartListData);
          setSelectedScheduleDetailsRows([]);
        })
        .catch((error) => {
          toast.error("An error occurred while saving data.");
        });
    }
    onOkButtonClick();
    onHide();
  };
  return (
    <div>
      <Modal
        {...props}
        size="sm"
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-sm">
            ScheduleDetails
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>Part Data Updated</Modal.Body>
        <Modal.Footer>
          <button
            className="button-style "
            style={{ width: "75px" }}
            onClick={handleOkClick}
          >
            OK
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
