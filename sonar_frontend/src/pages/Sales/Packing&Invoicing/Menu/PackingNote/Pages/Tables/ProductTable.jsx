import { useState } from "react";
import { Table } from "react-bootstrap";
import { FaArrowUp } from "react-icons/fa";
import { validatedNum } from "../../../../../../../utils/helpers";

// Displays the product table with sorting functionality
export default function ProductTable(props) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Returns sorted data based on selected column and direction
  const sortedData = () => {
    let dataCopy = [...props.invDetailsData];

    if (sortConfig.key) {
      dataCopy.sort((a, b) => {
        if (!parseFloat(a[sortConfig.key]) || !parseFloat(b[sortConfig.key])) {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        } else {
          if (parseFloat(a[sortConfig.key]) < parseFloat(b[sortConfig.key])) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (parseFloat(a[sortConfig.key]) > parseFloat(b[sortConfig.key])) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }
      });
    }

    return dataCopy;
  };

  // Handles sorting request for a column
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <Table striped className="table-data border" style={{ border: "1px" }}>
        <thead className="tableHeaderBGColor">
          <tr>
            <th>SL No</th>
            <th onClick={() => requestSort("Dwg_No")} className="cursor">
              Drawing Name
              <FaArrowUp
                className={
                  sortConfig.key === "Dwg_No"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("Mtrl")} className="cursor">
              Material
              <FaArrowUp
                className={
                  sortConfig.key === "Mtrl"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("Qty")} className="cursor">
              Quantity
              <FaArrowUp
                className={
                  sortConfig.key === "Qty"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("Unit_Rate")} className="cursor">
              Unit Rate
              <FaArrowUp
                className={
                  sortConfig.key === "Unit_Rate"
                    ? sortConfig.direction === "desc"
                      ? "rotateClass"
                      : ""
                    : "displayNoneClass"
                }
              />
            </th>
            <th onClick={() => requestSort("DC_Srl_Amt")} className="cursor">
              Total
              <FaArrowUp
                className={
                  sortConfig.key === "DC_Srl_Amt"
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
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{data.Dwg_No}</td>
              <td>{data.Mtrl}</td>
              <td>{data.Qty}</td>
              <td>{parseFloat(data.Unit_Rate).toFixed(2)}</td>
              <td>
                {validatedNum(
                  (props.invRegisterData.ScheduleType === "Sales"
                    ? parseFloat(data.JW_Rate) + parseFloat(data.Mtrl_rate)
                    : parseFloat(data.JW_Rate)) * data.Qty
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
