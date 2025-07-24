import { useState } from "react";
import { Table } from "react-bootstrap";
import Axios from "axios";
import { toast } from "react-toastify";
import { apipoints } from "../../../../../../api/PackInv_API/Inspection/InspProfi";
import YesNoModal from "../Modals/YesNoModal";
import InternalRejectionModal from "../Modals/InternalRejectionModal";

// ScheduleDetails manages the display and actions for schedule details, including clear, reset, and reject operations
export default function ScheduleDetails(props) {
  const [VeryNewRejData, setVeryNewRejData] = useState([]);

  const {
    getOrderScheduleData,
    orderScheduleDetailsData,
    setOrderScheduleDetailsData,
    selectedScheduleDetailsRows,
    setSelectedScheduleDetailsRows,
    headerData,
  } = props;

  const [smShow, setSmShow] = useState(false);
  const [lgShow, setLgShow] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [rejFormData, setRejFormData] = useState([]);
  const [newRejId, setNewRejId] = useState(null);
  const [reportNo, setReportNo] = useState("Draft");
  const [rejectedValue, setRejectedValue] = useState(0);
  const [acceptedValue, setAcceptedValue] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  let initialValuess = selectedScheduleDetailsRows.map(
    (val) => val.QtyProduced - val.QtyCleared - val.QtyRejected
  );

  const [qtyRejectt, setQtyRejectt] = useState(initialValuess);

  // Shows tooltip on mouse enter
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  // Hides tooltip on mouse leave
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Handles clear and save action for selected rows
  const clearAndSave = () => {
    // Check if any row is selected
    if (selectedScheduleDetailsRows.length === 0) {
      toast.warning(`Please select the row.`);
      return;
    }
    // if (selectedScheduleDetailsRows.QtyDelivered != 0) {
    //   toast.warning(`Dwg was Delivered, Please choose another`);
    //   return;
    // }
    // for (const row of selectedScheduleDetailsRows) {
    // 	if (row.QtyProduced === row.QtyRejected || row.QtyDelivered != 0) {
    // 		toast.warning(
    // 			`Please select the rows or ensure Cleared is less than Produced`
    // 		);
    // 		return;
    // 	}
    // }

    setActionType("clear");
    setSmShow(true);
  };
  const resetAndSave = () => {
    // Check if any row is selected
    if (selectedScheduleDetailsRows.length === 0) {
      toast.warning(`Please select the row.`);
      return;
    }
    for (const row of selectedScheduleDetailsRows) {
      if (row.QtyProduced === row.QtyRejected) {
        toast.warning(
          `Please select the rows or ensure Cleared is less than Produced`
        );
        return;
      }
    }

    setActionType("reset");
    setSmShow(true);
  };

  // Handles reject and save action for selected rows
  const rejectAndSave = () => {
    try {
      // if (
      // 	selectedScheduleDetailsRows.length === 0 ||
      // 	selectedScheduleDetailsRows.some(
      // 		(row) => row.QtyCleared === row.QtyProduced
      // 	)
      // ) {
      // 	toast.warning(
      // 		`Please select the rows or ensure Cleared is less than Produced`
      // 	);
      // 	return;
      // }
      // for (const row of selectedScheduleDetailsRows) {
      // 	if (row.QtyRejected === row.QtyProduced) {
      // 		toast.warning(
      // 			`Please select the rows or ensure Cleared is less than Produced`
      // 		);
      // 		return;
      // 	} else if (row.QtyCleared + row.QtyProduced == row.QtyRejected) {
      // 		toast.warning(
      // 			`Please select the rows or ensure Cleared is less than Produced`
      // 		);
      // 		return;
      // 	}
      // }

      if (selectedScheduleDetailsRows.length > 0) {
        setLgShow(true);

        Axios.post(apipoints.RejectionReport, {})
          .then((res) => {
            setRejFormData(res.data);
          })

          .catch((error) => {
            toast.error("An error occurred while saving data.");
          });
      }
    } catch (error) {}
  };

  // Handles closing of the modal and resets related state
  const handleModalClose = () => {
    setLgShow(false);
    setNewRejId(null);
    setReportNo("Draft");
    setRejectedValue(0);
    setAcceptedValue(0);
  };

  // Handles OK button click in modal and triggers appropriate action
  const handleOkButtonClick = () => {
    if (actionType === "clear") {
      clearAndSave();
    } else if (actionType === "reset") {
      resetAndSave();
    } else if (actionType === "reject") {
      resetAndSave();
    }

    setSmShow(false);
    setActionType(null);
  };

  for (let i = 0; i < selectedScheduleDetailsRows.length; i++) {
    const element = selectedScheduleDetailsRows[i];

    console.log(
      "selectedScheduleDetailsRows.QtyDelivered",
      element.QtyDelivered
    );
  }

  // useEffect(() => {
  //   getOrderScheduleData();
  // }, []);

  // useEffect(() => {
  //   if (
  //     orderScheduleDetailsData.length > 0 &&
  //     !selectedScheduleDetailsRows.refName
  //   ) {
  //     selectedRowFn(orderScheduleDetailsData[0], 0); // Select the first row
  //   }
  // }, [orderScheduleDetailsData, selectedScheduleDetailsRows, selectedRowFn]);
  // table header filtering
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Handles sorting for table headings
  const requestSort = (key) => {
    console.log("entering into the request sort");
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Returns sorted data for the table
  const sortedData = () => {
    const dataCopy = [...orderScheduleDetailsData];

    if (sortConfig.key) {
      dataCopy.sort((a, b) => {
        let valueA = a[sortConfig.key];
        let valueB = b[sortConfig.key];

        // Convert only for the "intiger" columns
        if (
          sortConfig.key === "JWCost" ||
          sortConfig.key === "MtrlCost" ||
          sortConfig.key === "UnitPrice" ||
          sortConfig.key === "Qty_Ordered" ||
          sortConfig.key === "Total"
        ) {
          valueA = parseFloat(valueA);
          valueB = parseFloat(valueB);
        }

        if (valueA < valueB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return dataCopy;
  };
  return (
    <>
      <div className="row m-2">
        <div className="col-md-12 col-sm-12">
          <button className={"button-style"} onClick={clearAndSave}>
            Clear All Parts
          </button>
          <button
            className={"button-style"}
            onClick={resetAndSave}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Reset All Parts
          </button>
          <button className={"button-style"} onClick={rejectAndSave}>
            Reject Parts
          </button>
          <YesNoModal
            show={smShow}
            setSmShow={setSmShow}
            onHide={() => setSmShow(false)}
            actionType={actionType}
            setActionType={setActionType}
            onOkButtonClick={handleOkButtonClick}
            orderScheduleDetailsData={orderScheduleDetailsData}
            setOrderScheduleDetailsData={setOrderScheduleDetailsData}
            selectedScheduleDetailsRows={selectedScheduleDetailsRows}
            setSelectedScheduleDetailsRows={setSelectedScheduleDetailsRows}
          />
          <InternalRejectionModal
            VeryNewRejData={VeryNewRejData}
            setVeryNewRejData={setVeryNewRejData}
            show={lgShow}
            setLgShow={setLgShow}
            selectedScheduleDetailsRows={selectedScheduleDetailsRows}
            setSelectedScheduleDetailsRows={setSelectedScheduleDetailsRows}
            rejFormData={rejFormData}
            newRejId={newRejId}
            setNewRejId={setNewRejId}
            setRejFormData={setRejFormData}
            reportNo={reportNo}
            setReportNo={setReportNo}
            rejectedValue={rejectedValue}
            setRejectedValue={setRejectedValue}
            acceptedValue={acceptedValue}
            setAcceptedValue={setAcceptedValue}
            orderScheduleDetailsData={orderScheduleDetailsData}
            setOrderScheduleDetailsData={setOrderScheduleDetailsData}
            headerData={headerData}
            getOrderScheduleData={getOrderScheduleData}
            qtyRejectt={qtyRejectt}
            actionType={actionType}
            setActionType={setActionType}
            smShow={smShow}
            setSmShow={setSmShow}
            handleOkButtonClick={handleOkButtonClick}
            onHide={() => handleModalClose()}
          />
        </div>
      </div>
      <div style={{ maxHeight: "400px", overflow: "auto" }}>
        <Table striped className="table-data border">
          <thead
            className="tableHeaderBGColor "
            style={{ whiteSpace: "nowrap", textAlign: "center" }}
          >
            <tr>
              <th>SL No</th>
              <th onClick={() => requestSort("DwgName")}>Dwg Name</th>
              <th onClick={() => requestSort("Mtrl_Code")}>Material</th>
              <th onClick={() => requestSort("Mtrl_Source")}>Source</th>
              <th onClick={() => requestSort("Operation")}>Process</th>
              <th onClick={() => requestSort("QtyScheduled")}>Scheduled</th>
              <th onClick={() => requestSort("QtyProduced")}>Produced</th>
              <th onClick={() => requestSort("QtyCleared")}>Cleared</th>
              <th onClick={() => requestSort("QtyRejected")}>Rejected</th>
              <th onClick={() => requestSort("QtyPacked")}>Packed</th>
              <th onClick={() => requestSort("QtyDelivered")}>Deliverd</th>
              <th onClick={() => requestSort("InDraftPN")}>In Draft PN</th>
              <th onClick={() => requestSort("Mtrl_Code")}>Pack Now</th>
              <th onClick={() => requestSort("JWCost")}>JW Cost</th>
              <th onClick={() => requestSort("MtrlCost")}>Mtrl Cost</th>
            </tr>
          </thead>
          <tbody
            className="tablebody"
            style={{ whiteSpace: "nowrap", textAlign: "center" }}
          >
            {sortedData()?.map((val, key) => (
              <tr
                className={
                  props.selectedScheduleDetailsRows.includes(val)
                    ? "selectedRowClr"
                    : ""
                }
                onClick={(e) => {
                  if (props.selectedScheduleDetailsRows.includes(val)) {
                    const newArray = props.selectedScheduleDetailsRows.filter(
                      (obj) => obj.SchDetailsID != val.SchDetailsID
                    );
                    props.setSelectedScheduleDetailsRows(newArray);
                  } else {
                    props.setSelectedScheduleDetailsRows([
                      ...props.selectedScheduleDetailsRows,
                      val,
                    ]);
                  }
                }}
              >
                <td>{key + 1}</td>
                <td>{val.DwgName}</td>
                <td>{val.Mtrl_Code}</td>
                <td>{val.Mtrl_Source}</td>
                <td>{val.Operation}</td>
                <td>{val.QtyScheduled}</td>
                <td>{val.QtyProduced}</td>
                <td>{val.QtyCleared}</td>
                <td>{val.QtyRejected}</td>
                <td>{val.QtyPacked}</td>
                <td>{val.QtyDelivered}</td>
                <td>{val.InDraftPN}</td>
                <td>
                  {parseInt(val.QtyCleared) -
                    parseInt(val.QtyPacked) -
                    parseInt(val.InDraftPN)}
                </td>
                <td>{parseFloat(val.JWCost).toFixed(2)}</td>
                <td>{parseFloat(val.MtrlCost).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
