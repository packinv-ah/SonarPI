import { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import { useNavigate } from "react-router-dom";
import { apipoints } from "../../../../../api/PackInv_API/ReturnableDC/ReturnableDC";
import Axios from "axios";
import { toast } from "react-toastify";

// Displays the list of despatched Returnable DCs with filtering and sorting
function DCListDespatched() {
  const [despatchTable, setDespatchTable] = useState([]);
  const [dcSelectedRow, setDCSelectedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [allCustomers, setAllCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Handles row selection in the DC table
  const handleRowSelect = (selectedRow) => {
    setDCSelectedRow((prevSelectedRow) =>
      prevSelectedRow === selectedRow ? null : selectedRow
    );
  };

  useEffect(() => {
    // Fetches despatched DCs and customer names on mount
    async function fetchData() {
      try {
        const [dcResponse, customersResponse] = await Promise.all([
          Axios.get(apipoints.dcDespatched),
          Axios.get(apipoints.getAllCust),
        ]);

        setDespatchTable(dcResponse.data);

        const customerNames = customersResponse.data.map((customer) => ({
          label: customer.Cust_name,
          ...customer,
        }));
        setAllCustomers(customerNames);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handles sorting request for a column
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handles the Open button click to navigate to DC details
  const handleOpenClick = () => {
    if (!dcSelectedRow) {
      toast.error("Select a customer");
    } else {
      navigate("/PackingAndInvoices/ReturnableDC/DCCreateNew", {
        state: { dcSelectedRow },
      });
    }
  };

  // Handles the Close button click to navigate back
  const handleCloseClick = () => {
    navigate("/PackingAndInvoices");
  };

  // Returns sorted and filtered DC data
  const sortedData = () => {
    const dataCopy = [...despatchTable];
    const filtered = selectedCustomer
      ? dataCopy.filter((data) => data.Cust_Name === selectedCustomer.label)
      : dataCopy;

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  // Handles customer selection from the filter dropdown
  const handleCustomerSelect = (selected) => {
    setSelectedCustomer(selected && selected.length > 0 ? selected[0] : null);
  };

  return (
    <div>
      <div className="col-md-12">
        <h4 className="title">Returnable DC List</h4>
      </div>
      <h5 className="mt-1">
        <label className="form-label">
          PN List : Returnable DC Status Dispatched
        </label>
      </h5>

      <div className="row">
        <div className="d-flex col-md-5" style={{ gap: "10px" }}>
          <label className="form-label">Customer</label>
          <Typeahead
            className="ip-select mt-1"
            id="customerFilterTypeahead"
            labelKey="label"
            options={allCustomers}
            onChange={handleCustomerSelect}
            placeholder="Select a customer..."
          />
        </div>

        <div className="col-md-7">
          <button className="button-style" onClick={handleOpenClick}>
            Open
          </button>

          <button className="button-style" onClick={handleCloseClick}>
            Close
          </button>
        </div>
      </div>

      <div className="mt-4 row">
        <div className="col-md-8 col-sm-12">
          <div
            style={{
              overflowX: "scroll",
              overflowY: "scroll",
              height: "400px",
            }}
          >
            <Table
              striped
              className="table-data border"
              style={{ border: "1px" }}
            >
              <thead
                className="tableHeaderBGColor"
                style={{
                  position: "sticky",
                  top: "-1px",
                }}
              >
                <tr>
                  <th
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => requestSort("DC_No")}
                  >
                    PN No
                  </th>
                  <th
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => requestSort("DC_Date")}
                  >
                    PN Date
                  </th>
                  <th
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => requestSort("Cust_Name")}
                  >
                    Customer Name
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="3">Loading...</td>
                  </tr>
                ) : sortedData().length === 0 ? (
                  <tr>
                    <td colSpan="3">No data found</td>
                  </tr>
                ) : (
                  sortedData().map((data, index) => (
                    <tr
                      key={index}
                      onClick={() =>
                        handleRowSelect({
                          dcInvNo: data.DC_Inv_No,
                          custStateId: data.Cust_StateId,
                          delStateId: data.Del_StateId,
                          custName: data.Cust_Name,
                          custCode: data.Cust_Code,
                          gstNo: data.GSTNo,
                        })
                      }
                      className={`${
                        dcSelectedRow &&
                        dcSelectedRow.dcInvNo === data.DC_Inv_No &&
                        dcSelectedRow.custStateId === data.Cust_StateId &&
                        dcSelectedRow.delStateId === data.Del_StateId &&
                        dcSelectedRow.custName === data.Cust_Name
                          ? "selectedRowClr"
                          : ""
                      } `}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{data.DC_No}</td>
                      <td>
                        {data.DC_Date
                          ? new Date(data.DC_Date).toLocaleDateString("en-GB")
                          : ""}
                      </td>
                      <td>{data.Cust_Name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DCListDespatched;
