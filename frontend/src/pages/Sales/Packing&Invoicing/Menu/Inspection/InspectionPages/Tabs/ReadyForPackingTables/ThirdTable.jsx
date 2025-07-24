import { useState } from "react";
import Table from "react-bootstrap/Table";
import { FaArrowUp } from "react-icons/fa";
import { toast } from "react-toastify";

// Table for editing and sorting invoice details data
export default function ThirdTable(props) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Modifies invoice details data based on user input and validates quantities
  const modifyInvDetailsData = (e, key) => {
    let totalQtyForDwg = 0;
    let OrderSchDetailsID = "";
    if (e.target.name === "Qty") {
      for (let i = 0; i < props.allInvDetailsData.length; i++) {
        const element = props.allInvDetailsData[i];
        if (
          element.OrderSchDetailsID ===
            props.invDetailsData[key].OrderSchDetailsID &&
          element.DespStatus != "Cancelled"
        ) {
          OrderSchDetailsID = element.OrderSchDetailsID;
          totalQtyForDwg =
            parseInt(totalQtyForDwg) + parseInt(e.target.value || 0);
        }
      }
      for (let i = 0; i < props.orderScheduleDetailsData.length; i++) {
        const element = props.orderScheduleDetailsData[i];
        if (
          element.SchDetailsID === OrderSchDetailsID &&
          parseInt(element.QtyCleared) < parseInt(totalQtyForDwg)
        ) {
          toast.warning(
            `${element.DwgName + " : Pack quantity greater then cleared qty"}`
          );
        }
      }
    }

    const newArray = [];

    for (let i = 0; i < props.invDetailsData.length; i++) {
      const element = props.invDetailsData[i];

      if (i === key) {
        element[e.target.name] = parseFloat(e.target.value);
      }

      newArray.push(element);
    }

    props.setInvDetailsData(newArray);
  };

  // Returns sorted invoice details data based on selected column and direction
  const sortedData = () => {
    let dataCopy = [...props.invDetailsData];

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

  // Prevents invalid key inputs for weight fields
  const weightValidations = (e) => {
    if (
      e.which === 38 ||
      e.which === 40 ||
      ["e", "E", "+", "-"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  // Prevents invalid key inputs for quantity fields
  const qtyValidations = (e) => {
    if (
      e.which === 38 ||
      e.which === 40 ||
      ["e", "E", "+", "-", "."].includes(e.key)
    ) {
      e.preventDefault();
    }
  };
  return (
    <>
      <Table striped className="table-data border" style={{ border: "1px" }}>
        <thead className="tableHeaderBGColor">
          <tr>
            <th onClick={() => requestSort("Dwg_No")} className="cursor">
              Dwg No
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
              Qty
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
            <th onClick={() => requestSort("Unit_Wt")} className="cursor">
              Unit Wt
              <FaArrowUp
                className={
                  sortConfig.key === "Unit_Wt"
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
          {sortedData().map((val, key) => (
            <tr>
              <td>{val.Dwg_No}</td>
              <td>{val.Mtrl}</td>
              <td>
                <input
                  type="number"
                  value={val.Qty}
                  name="Qty"
                  autoComplete="off"
                  disabled={val.DespStatus != "Draft"}
                  className={val.DespStatus != "Draft" ? "input-disabled" : ""}
                  style={{ background: "none", border: "none" }}
                  onKeyDown={qtyValidations}
                  onChange={(e) => {
                    if (parseInt(e.target.value) < 0) {
                      e.target.value = parseInt(e.target.value) * -1;
                      toast.warning("Qty can't be negative");
                      modifyInvDetailsData(e, key);
                    } else if (parseInt(e.target.value) === 0) {
                      toast.warning("Qty can't be zero");
                    } else {
                      modifyInvDetailsData(e, key);
                    }
                  }}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="Unit_Wt"
                  value={val.Unit_Wt}
                  autoComplete="off"
                  disabled={val.DespStatus != "Draft"}
                  className={val.DespStatus != "Draft" ? "input-disabled" : ""}
                  style={{ background: "none", border: "none" }}
                  onKeyDown={weightValidations}
                  onChange={(e) => {
                    if (parseFloat(e.target.value).toFixed(1) < 0.0) {
                      e.target.value = parseFloat(e.target.value) * -1;
                      toast.warning("Weight can't be negative");
                      modifyInvDetailsData(e, key);
                    } else if (parseFloat(e.target.value).toFixed(1) === 0.0) {
                      toast.warning("Weight can't be zero");
                    } else {
                      modifyInvDetailsData(e, key);
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
