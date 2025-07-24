import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Axios from "axios";
import { apipoints } from "../../../../../api/PackInv_API/Invoice/Invoice";
import { Typeahead } from "react-bootstrap-typeahead";
import { Link } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";

// Displays and manages the invoice/packing note list and filtering
export default function List(props) {
  const [AllCust, setAllCust] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [AllTableData, setAllTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  useEffect(() => {
    Axios.post(apipoints.getListData, {
      PNList: props.PNList,
      Status: props.Status,
    }).then((res) => {
      setTableData(res.data);
      setAllTableData(res.data);

      Axios.post(apipoints.getCustAccnToListData, {
        PNList: props.PNList,
        Status: props.Status,
      }).then((res) => {
        let arr = [{ label: "All", Cust_Code: "All" }];
        for (let i = 0; i < res.data.length; i++) {
          res.data[i].label = res.data[i].Cust_name;
          arr.push(res.data[i]);
        }
        setAllCust(arr);
      });
    });
  }, []);

  // Handles customer selection and filters table data
  const handleCustomerChange = (e) => {
    setSelectedRow({});
    setSortConfig({ key: null, direction: null });

    if (
      e[0]?.Cust_Code === undefined ||
      e[0]?.Cust_Code === null ||
      e[0]?.Cust_Code === "" ||
      e[0]?.Cust_Code.length === 0 ||
      e[0]?.Cust_Code === "All"
    ) {
      setTableData(AllTableData);
    } else {
      const newArray = AllTableData.filter(
        (obj) => obj.Cust_Code === e[0].Cust_Code
      );
      setTableData(newArray);
    }
  };

  // Returns sorted table data based on sortConfig
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

  // Handles sorting request for table columns
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <div>
        <h4 className="title m-0">{props.heading || "Invoice List"}</h4>
        <div className="row pt-2 pb-3">
          <div className="col-md-6 d-flex align-items-center">
            <h5 className="">
              <label className="form-label">PN List: </label>
              <label className="form-label">{props.PNList || "..."} | </label>
              <label className="form-label">Status: </label>
              <label className="form-label">{props.Status || "..."}</label>
            </h5>
          </div>
          <div className="d-flex col-md-6" style={{ gap: "10px" }}>
            <label className="form-label">Customer</label>
            <Typeahead
              className="ip-select"
              id="basic-example"
              placeholder="Select a customer..."
              options={AllCust}
              onChange={handleCustomerChange}
              defaultSelected={[{ label: "All" }]}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-9">
            <div style={{ maxHeight: "60vh", overflow: "auto" }}>
              <Table striped className="table-data border">
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
                    <th
                      onClick={() => requestSort("DC_Date")}
                      className="cursor"
                    >
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
                    <th
                      onClick={() => requestSort("Cust_Name")}
                      className="cursor"
                    >
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
                <tbody>
                  {sortedData().length === 0 ? (
                    <tr>
                      <td colSpan="2"></td>
                      <td>No data found</td>
                      <td colSpan="2"></td>
                    </tr>
                  ) : (
                    sortedData().map((data, index) => (
                      <tr
                        key={index}
                        onClick={(e) => {
                          if (selectedRow?.DC_Inv_No === data.DC_Inv_No) {
                            setSelectedRow({});
                          } else {
                            setSelectedRow(data);
                          }
                        }}
                        className={
                          selectedRow?.DC_Inv_No === data.DC_Inv_No
                            ? "selectedRowClr"
                            : ""
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td>{index + 1}</td>
                        <td>{data.DC_InvType}</td>
                        <td>{data.DC_No}</td>
                        <td>{data.Printable_DC_Date}</td>
                        <td>{data.Cust_Name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex flex-row justify-content-between">
              <div style={{ width: "42%" }}>
                {!selectedRow?.DC_Inv_No ? (
                  <button disabled className={"button-style button-disabled"}>
                    Open
                  </button>
                ) : (props.PNList === "Profile" ||
                    props.PNList === "Service" ||
                    props.PNList === "Fabrication") &
                  (props.Status === "Dispatched") ? (
                  <Link
                    to={"/PackingAndInvoices/PackingNote/Description"}
                    state={selectedRow?.DC_Inv_No}
                  >
                    <button className={"button-style"}>Open</button>
                  </Link>
                ) : (
                  <Link
                    to={"/PackingAndInvoices/Invoice/InvoiceDetails"}
                    state={selectedRow?.DC_Inv_No}
                  >
                    <button className={"button-style"}>Open</button>
                  </Link>
                )}
              </div>
              <div>
                <Link to="/PackingAndInvoices">
                  <button className="button-style">Close</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
