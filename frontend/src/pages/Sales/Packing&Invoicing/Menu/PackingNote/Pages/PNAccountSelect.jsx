import { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import Axios from "axios";
import { apipoints } from "../../../../../api/PackInv_API/PackingNote/PackingNote";
import { FaArrowUp } from "react-icons/fa";

// Displays the packing note account selection table with sorting and navigation
export default function ProfileOpenForm(props) {
  const [PNType, setPNType] = useState(props.PNType);
  const [Status, setStatus] = useState("Packed");
  const [custCode, setCustCode] = useState();
  const [selectRow, setSelectRow] = useState();
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Fetches packing note profile invoices on mount
  useEffect(() => {
    Axios.post(apipoints.pnprofileinvoices, {
      PNType: PNType,
      Status: Status,
      custCode: custCode,
    }).then((res) => {
      setTableData(res.data);
    });
  }, []);

  // Sets the selected row for navigation
  const selectedRowFun = (val) => {
    setSelectRow(val);
  };

  // Returns sorted table data based on selected column and direction
  const sortedData = () => {
    let dataCopy = [...tableData];

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

  // Handles sorting request for a column
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <div className="">
        <h4 className="title">Packing Note List</h4>
      </div>
      <h5 className="mt-1" style={{ fontSize: "14px" }}>
        <b>
          PN List : {PNType} Status {Status}
        </b>
      </h5>
      <div className="row">
        <div
          className="col-md-8"
          style={{
            maxHeight: "450px",
            overflow: "auto",
          }}
        >
          <Table
            striped
            className="table-data border"
            style={{
              border: "1px",
            }}
          >
            <thead className="tableHeaderBGColor">
              <tr>
                <th>SL No</th>
                <th
                  onClick={() => requestSort("DC_InvType")}
                  className="cursor"
                >
                  Inv Type
                  <FaArrowUp
                    className={
                      sortConfig.key === "DC_InvType"
                        ? sortConfig.direction === "desc"
                          ? "rotateClass"
                          : ""
                        : "displayNoneClass"
                    }
                  />
                </th>
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
                <th onClick={() => requestSort("DC_Date")} className="cursor">
                  PN Date
                  <FaArrowUp
                    className={
                      sortConfig.key === "DC_Date"
                        ? sortConfig.direction === "desc"
                          ? "rotateClass"
                          : ""
                        : "displayNoneClass"
                    }
                  />
                </th>
                <th onClick={() => requestSort("Cust_Name")} className="cursor">
                  Customer Name
                  <FaArrowUp
                    className={
                      sortConfig.key === "Cust_Name"
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
                  key={index}
                  onClick={() => selectedRowFun(data.DC_Inv_No)}
                  className={
                    data.DC_Inv_No === selectRow ? "selectedRowClr" : ""
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td>{index + 1}</td>
                  <td>{data.DC_InvType}</td>
                  <td>{data.DC_No}</td>
                  <td>{data.Printable_DC_Date}</td>
                  <td>{data.Cust_Name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="col-md-4">
          <div className="d-flex flex-row justify-content-between">
            <div>
              {selectRow ? (
                PNType === "Misc" ? (
                  <Link
                    to={`/PackingAndInvoices/Invoice/InvoiceDetails`}
                    state={selectRow}
                  >
                    <button className="button-style group-button">Open</button>
                  </Link>
                ) : (
                  <Link
                    to={`/PackingAndInvoices/PackingNote/Description`}
                    state={selectRow}
                  >
                    <button className="button-style group-button">Open</button>
                  </Link>
                )
              ) : (
                <button className="button-style button-disabled" disabled>
                  Open
                </button>
              )}
            </div>
            <div style={{ width: "42%" }}>
              <Link to="/PackingAndInvoices">
                <button className="button-style" style={{ float: "right" }}>
                  Close
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
