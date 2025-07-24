import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typeahead } from "react-bootstrap-typeahead";
import { Link } from "react-router-dom";
import Axios from "axios";
import { apipoints } from "../../../../../api/PackInv_API/Inspection/InspProfi";

const { postRequest } = require("../../../../../api/apiinstance");
const { endpoints } = require("../../../../../api/constants");

// FindSchedule handles searching and navigation for order schedules
function FindSchedule() {
  const nav = useNavigate();
  const [custdata, setCustData] = useState("");

  let [schId, setSchId] = useState("");
  let [tableData, setTableData] = useState([]);

  const [selectedOption, setSelectedOption] = useState("");

  const [scheduleID, setScheduleID] = useState();

  // Handles option change in dropdown
  const handleOptionChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
  };

  // Fetches table data for schedules
  useEffect(() => {
    Axios.post(apipoints.getOrderDataforFindSchedule, {}).then((res) => {
      setTableData(res.data);
    });
  }, []);

  // Fetches customer data for dropdown
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

  return (
    <>
      <div>
        <h4 className="title">Find Schedule</h4>

        <div className="row">
          <div className="col-md-3 col-sm-6 mt-1">
            <div className="d-flex">
              <div className="col-4">
                <label className="form-label">Find Schedule</label>
              </div>
              <div className="col-8">
                {custdata.length > 0 ? (
                  <Typeahead
                    className="ip-select mt-1"
                    id="basic-example"
                    options={tableData.map((item) => ({
                      label: item.OrdSchNo,
                      value: item.ScheduleId,
                    }))}
                    placeholder="Select ..."
                    onChange={(selected) => {
                      setSchId(selected[0]?.value);
                    }}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <Link
              to={`/PackingAndInvoices/Inspection/OrderScheduleDetails`}
              state={schId}
            >
              <button
                className={
                  schId ? "button-style" : "button-style button-disabled"
                }
                disabled={!schId}
              >
                Open
              </button>
            </Link>
          </div>

          <div className="col-md-3"></div>

          <div className="col-md-3">
            <div className="">
              <button
                className="button-style mt-2"
                id="btnclose"
                style={{ float: "right" }}
                type="submit"
                onClick={() => nav("/PackingAndInvoices")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
        <div className="row">
          <div
            style={{
              maxHeight: "350px",
              overflow: "auto",
              marginTop: "25px",
            }}
          ></div>
        </div>
      </div>
    </>
  );
}

export default FindSchedule;
