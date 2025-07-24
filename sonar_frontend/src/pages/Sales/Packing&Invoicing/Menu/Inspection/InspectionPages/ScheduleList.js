import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typeahead } from "react-bootstrap-typeahead";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import Axios from "axios";
import { apipoints } from "../../../../../api/PackInv_API/Inspection/InspProfi";

const { postRequest } = require("../../../../../api/apiinstance");
const { endpoints } = require("../../../../../api/constants");

// ScheduleList displays and manages the schedule list for selected customers and types
function ScheduleList(props) {
  const nav = useNavigate();
  const [SchType, setSchType] = useState(props.Type);
  const [custdata, setCustData] = useState("");
  let [custcode, setCustCode] = useState("");
  let [tableData, setTableData] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [scheduleID, setScheduleID] = useState();

  const handleOptionChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
  };

  useEffect(() => {
    if (custcode && selectedOption) {
      Axios.post(apipoints.getOrderSchdata, {
        custCode: custcode,
        SchType: SchType,
        selectedOption: selectedOption,
      }).then((res) => {
        setTableData(res.data);
      });
    }
  }, [custcode, selectedOption]);

  useEffect(() => {
    async function fetchData() {
      postRequest(endpoints.getCustomers, {}, (custdetdata) => {
        for (let i = 0; i < custdetdata.length; i++) {
          custdetdata[i].label = custdetdata[i].Cust_name;
        }
        setCustData(custdetdata);
      });
    }
    fetchData();
  }, []);

  let selectCust = async (e) => {
    let cust;
    for (let i = 0; i < custdata.length; i++) {
      if (custdata[i]["Cust_Code"] === e[0]?.Cust_Code) {
        cust = custdata[i];
        break;
      }
    }
    setCustCode(cust?.Cust_Code);
    Axios.post(apipoints.getOrderSchdata, {
      custCode: cust?.Cust_Code,
      SchType: SchType,
      selectedOption: selectedOption,
    }).then((res) => {
      setTableData(res.data);
    });
  };

  const selectedRowFun = (val) => {
    setScheduleID(val.ScheduleId);
  };

  return (
    <>
      <div>
        <h4 className="title">{props.Type} Schedule List</h4>
        <div className="row">
          <div className="d-flex col-md-4" style={{ gap: "10px" }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>
              Select Customer
              <span
                style={{
                  color: "#f20707",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                *
              </span>
            </label>
            {custdata.length > 0 ? (
              <Typeahead
                className="ip-select mt-2"
                id="basic-example "
                options={custdata}
                placeholder="Select Customer"
                onChange={(selectedCustomer) => selectCust(selectedCustomer)}
              />
            ) : (
              ""
            )}
          </div>
          <div className="col-md-4">
            <Link
              to={`/PackingAndInvoices/Inspection/OrderScheduleDetails`}
              state={scheduleID}
            >
              <button
                className={
                  scheduleID ? "button-style" : "button-style button-disabled"
                }
                disabled={!scheduleID}
              >
                Open
              </button>
            </Link>
          </div>
          <div className="col-md-4">
            <button
              className="button-style"
              id="btnclose"
              style={{ float: "right" }}
              type="submit"
              onClick={() => nav("/PackingAndInvoices")}
            >
              Close
            </button>
          </div>
        </div>
        <div className="row">
          <div
            style={{
              maxHeight: "350px",
              width: "780px",
              overflow: "auto",
              marginTop: "25px",
            }}
          >
            <Table striped className="table-data border">
              <thead
                className="tableHeaderBGColor tablebody"
                style={{ textAlign: "center" }}
              >
                <tr>
                  <th>SL No</th>
                  <th>OrdSchNo</th>
                  <th>PO</th>
                </tr>
              </thead>
              <tbody className="tablebody" style={{ textAlign: "center" }}>
                {tableData?.map((val, i) => (
                  <tr
                    onClick={() => selectedRowFun(val)}
                    className={
                      val.ScheduleId === scheduleID ? "selectedRowClr" : ""
                    }
                  >
                    <td>{i + 1}</td>
                    <td>{val.OrdSchNo}</td>
                    <td>{val.PO}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ScheduleList;
