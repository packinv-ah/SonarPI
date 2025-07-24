import { useState, useEffect } from "react";
import { Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import Axios from "axios";
import { apipoints } from "../../../../../../api/PackInv_API/Invoice/Invoice";
import ConfirmationModal from "./ConfirmationModals/ConfirmationModal";

// Displays and manages the modal for importing IV details into invoice
export default function ImportFromIV(props) {
  const [IVList, setIVList] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedIV, setSelectedIV] = useState();

  // Handles closing the modal and resets selection
  const handleClose = (val) => {
    props.setSelectIV(false);
    setSelectedIV();
    setConfirmModalOpen(false);
    if (!val) {
      toast.warning("No serial to add");
    }
  };

  // Fetches the list of IVs available for import
  useEffect(() => {
    Axios.get(apipoints.getIVList, {}).then((res) => {
      setIVList(res.data);
    });
  }, []);

  // Imports selected IV details and updates invoice data
  const createPNForIV = () => {
    Axios.post(apipoints.getIVDetails, {
      Iv_Id: selectedIV.Iv_Id,
    }).then((res) => {
      if (res.data.flag === 1) {
        if (res.data.detailsData.length > 0) {
          toast.success(res.data.message);
          props.setInvDetailsData(res.data.detailsData);
          props.setInvRegisterData({
            ...props.invRegisterData,
            Iv_Id: res.data.Iv_Id,
          });
        } else {
          toast.warning("No srl to found to import");
        }
        handleClose(1);
      } else if (res.data.flag === 0) {
        toast.error(res.data.message);
      } else {
        toast.error("Frontend Error");
      }
    });
  };

  return (
    <>
      <Modal fullscreen show={props.selectIV} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select IV for Import</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="row">
            <div className="col-md-6">
              <div
                style={{
                  maxHeight: "579px",
                  overflow: "auto",
                }}
              >
                <Table striped className="table-data border">
                  <thead className="tableHeaderBGColor">
                    <tr>
                      <th>SL No</th>
                      <th>IV No</th>
                      <th>IV Date</th>
                      <th>Weight</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {IVList?.map((val, key) => (
                      <>
                        <tr
                          onClick={(e) => {
                            setSelectedIV(val);
                          }}
                          className={
                            selectedIV?.Iv_Id === val.Iv_Id
                              ? "selectedRowClr"
                              : ""
                          }
                        >
                          <td>{key + 1}</td>
                          <td>{val.IV_No}</td>
                          <td>{val.IV_Date}</td>
                          <td>{val.TotalWeight}</td>
                          <td>{val.Type}</td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-end">
                <button
                  disabled={!selectedIV?.Iv_Id}
                  className={
                    !selectedIV?.Iv_Id
                      ? "button-disabled button-style m-0"
                      : "button-style m-0"
                  }
                  onClick={(e) => {
                    setConfirmModalOpen(true);
                  }}
                >
                  Import IV
                </button>
              </div>
            </div>
          </div>
          <div>
            <ConfirmationModal
              setConfirmModalOpen={setConfirmModalOpen}
              confirmModalOpen={confirmModalOpen}
              message={`Do you wish to convert IV No ${selectedIV?.IV_No} to ${props.invRegisterData?.InvoiceFor} DC ?`}
              yesClickedFunc={createPNForIV}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
