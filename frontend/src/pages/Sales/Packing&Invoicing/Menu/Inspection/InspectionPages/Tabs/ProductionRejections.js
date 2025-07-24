import { useState, useEffect } from "react";
import Axios from "axios";
import { apipoints } from "../../../../../../api/PackInv_API/Inspection/InspProfi";
import { Table } from "react-bootstrap";

// Displays production rejection data and internal rejection details
export default function ProductionRejections(props) {
  const [selectRejRow, setselectRejRow] = useState([]);
  const [intRejeData, setIntRejeData] = useState();
  const { orderScheduleDetailsData, selectedReadyForPackingRows } = props;
  const [rejectionData, setRejectionData] = useState();

  // Fetches rejection data when orderScheduleDetailsData changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await Axios.post(apipoints.testRejectData, {
          scId: orderScheduleDetailsData[0]?.ScheduleId,
        });
        setRejectionData(res.data);
      } catch (error) {
        console.error("Error fetching rejection data:", error);
      }
    };

    if (orderScheduleDetailsData && orderScheduleDetailsData[0]?.ScheduleId) {
      fetchData();
    }
  }, [orderScheduleDetailsData]);

  // Handles row click to fetch and display internal rejection details
  const handleRowClick = (row) => {
    setselectRejRow((prevSelectedRow) =>
      prevSelectedRow === row ? null : row
    );

    Axios.post(apipoints.testInternalRejectData, {
      row,
    }).then((res) => {
      setIntRejeData(res.data);
    });
  };

  // Formats the report date to DD/MM/YYYY
  const formatReportDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB");
    return formattedDate;
  };

  return (
    <>
      <div>
        <div className="row">
          <div className="col-md-6 col-sm-12">
            <div style={{ maxHeight: "400px", overflow: "auto" }}>
              <Table striped className="table-data border">
                <thead
                  className="tableHeaderBGColor"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <tr>
                    <th>Rejection Rprt No</th>
                    <th>Raised by</th>
                    <th>internal</th>
                    <th>Report Date</th>
                    <th>Rejection value</th>
                    <th>Accepted value</th>
                  </tr>
                </thead>
                <tbody className="tablebody" style={{ textAlign: "center" }}>
                  {rejectionData?.map((val, i) => (
                    <tr
                      key={val.id}
                      onClick={() => handleRowClick(val)}
                      className={
                        selectRejRow && selectRejRow === val
                          ? "selectedRowClr"
                          : ""
                      }
                    >
                      <td>{rejectionData[i].Rej_ReportNo}</td>
                      <td>{rejectionData[i].RaisedBy}</td>
                      <td>{rejectionData[i].Internal}</td>
                      <td>
                        {formatReportDate(rejectionData[i].Rej_ReportDate)}
                      </td>
                      <td>{rejectionData[i].RejctionValue}</td>
                      <td>{rejectionData[i].AcceptedValue}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
          <div className="col-md-6 col-sm-12">
            <div style={{ maxHeight: "400px", overflow: "auto" }}>
              <Table striped className="table-data border">
                <thead className="tableHeaderBGColor tablebody">
                  <tr>
                    <th>Dwg Name</th>
                    <th>Qty Rejected</th>
                    <th>Rejection Reason</th>
                  </tr>
                </thead>
                <tbody className="tablebody" style={{ textAlign: "center" }}>
                  {intRejeData?.map((val, i) => (
                    <tr key={i}>
                      <td>{intRejeData[i].Dwg_Name}</td>
                      <td>{intRejeData[i].Qty_Rejected}</td>
                      <td>{intRejeData[i].Rejection_Reason}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
