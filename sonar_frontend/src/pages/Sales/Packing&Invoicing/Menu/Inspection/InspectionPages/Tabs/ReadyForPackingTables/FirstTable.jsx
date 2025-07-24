import { useState } from "react";
import Table from "react-bootstrap/Table";
import { FaArrowUp } from "react-icons/fa";

// Table for displaying and sorting ready-for-packing schedule details
export default function FirstTable(props) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Returns sorted data based on the selected column and direction
  const sortedData = () => {
    let dataCopy = [...props.orderScheduleDetailsData];

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
            <th>SL No</th>
            <th onClick={() => requestSort("DwgName")} className="cursor">
              Dwg Name
              <FaArrowUp
                className={
                  sortConfig.key === "DwgName"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("Mtrl_Code")} className="cursor">
              Material
              <FaArrowUp
                className={
                  sortConfig.key === "Mtrl_Code"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("QtyScheduled")} className="cursor">
              Scheduled
              <FaArrowUp
                className={
                  sortConfig.key === "QtyScheduled"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("QtyProduced")} className="cursor">
              Produced
              <FaArrowUp
                className={
                  sortConfig.key === "QtyProduced"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("QtyCleared")} className="cursor">
              Cleared
              <FaArrowUp
                className={
                  sortConfig.key === "QtyCleared"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("InDraftPN")} className="cursor">
              InDraftPN
              <FaArrowUp
                className={
                  sortConfig.key === "InDraftPN"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th>Pack Now </th>
            <th onClick={() => requestSort("PackingLevel")} className="cursor">
              Pkng
              <FaArrowUp
                className={
                  sortConfig.key === "PackingLevel"
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
              className={
                props.selectedReadyForPackingRows.includes(data)
                  ? "selectedRowClr"
                  : ""
              }
              onClick={(e) => {
                if (props.selectedReadyForPackingRows.includes(data)) {
                  const newArray = props.selectedReadyForPackingRows.filter(
                    (obj) => obj.SchDetailsID != data.SchDetailsID
                  );
                  props.setSelectedReadyForPackingRows(newArray);
                } else {
                  props.setSelectedReadyForPackingRows([
                    ...props.selectedReadyForPackingRows,
                    data,
                  ]);
                }
              }}
              style={
                parseInt(data.QtyCleared) -
                  parseInt(data.QtyPacked) -
                  parseInt(data.InDraftPN) <
                0
                  ? { backgroundColor: "#ff9900" }
                  : parseInt(data.QtyCleared) -
                      parseInt(data.QtyPacked) -
                      parseInt(data.InDraftPN) ===
                    0
                  ? { backgroundColor: "#9dff9d" }
                  : parseInt(data.QtyCleared) -
                      parseInt(data.QtyPacked) -
                      parseInt(data.InDraftPN) >
                    0
                  ? { backgroundColor: "#31c531" }
                  : null
              }
            >
              <td>{index + 1}</td>
              <td>{data.DwgName}</td>
              <td>{data.Mtrl_Code}</td>
              <td>{data.QtyScheduled}</td>
              <td>{data.QtyProduced}</td>
              <td>{data.QtyCleared}</td>
              <td>{data.InDraftPN}</td>
              <td>
                {parseInt(data.QtyCleared) -
                  parseInt(data.QtyPacked) -
                  parseInt(data.InDraftPN)}
              </td>
              <td>{data.PackingLevel}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
