import { useState } from "react";
import Table from "react-bootstrap/Table";
import { toast } from "react-toastify";
import { FaArrowUp } from "react-icons/fa";

// Table for displaying and sorting invoice register data
export default function SecondTable(props) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Returns sorted data based on the selected column and direction
  const sortedData = () => {
    let dataCopy = [...props.invRegisterData];

    if (sortConfig.key) {
      dataCopy.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return dataCopy;
  };

  // Handles sorting when a column header is clicked
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <Table striped className="table-data border" style={{ border: "1px" }}>
        <thead className="tableHeaderBGColor">
          <tr>
            <th>Type</th>
            <th onClick={() => requestSort("DC_No")} className="cursor">
              PN No
              <FaArrowUp
                className={
                  sortConfig.key === "DC_No"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("DCStatus")} className="cursor">
              Status
              <FaArrowUp
                className={
                  sortConfig.key === "DCStatus"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
          </tr>
        </thead>
        <tbody className="tablebody">
          {sortedData().map((data, index) => (
            <tr
              onClick={(e) => {
                props.setInvDetailsData([]);
                props.setSelectedRegisterRow({});

                if (props.selectedRegisterRow.DC_Inv_No === data.DC_Inv_No) {
                  props.setInvDetailsData([]);
                  props.setSelectedRegisterRow({});
                } else {
                  props.setSelectedRegisterRow(data);
                  const newArray = props.allInvDetailsData.filter(
                    (obj) => obj.DC_Inv_No === data.DC_Inv_No
                  );

                  if (newArray.length > 0) {
                    props.setInvDetailsData(newArray);
                  } else {
                    toast.warning("No data found for the row");
                  }
                }
              }}
              className={
                props.selectedRegisterRow.DC_Inv_No === data.DC_Inv_No
                  ? "selectedRowClr"
                  : ""
              }
            >
              <td>{data.DC_InvType}</td>
              <td>{data.DC_No}</td>
              <td>{data.DCStatus}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
