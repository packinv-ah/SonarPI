import Table from "react-bootstrap/Table";
import { useNavigate } from "react-router-dom";

function ScheduleDeatails() {
  const nav = useNavigate();
  return (
    <div>
      <div className="row justify-left-center m-2">
        <button className="button-style " style={{ width: "140px" }}>
          Clear All Parts
        </button>
        <button
          className="button-style "
          style={{ width: "140px", marginLeft: "4px" }}
        >
          Reset All Parts
        </button>
        <button
          className="button-style "
          onClick={() =>
            nav("/packingandinvoices/service/findschedule/RejectParts")
          }
          style={{ width: "120px", marginLeft: "4px" }}
        >
          Reject Parts
        </button>
      </div>
      <div style={{ height: "400px", overflowY: "scroll" }}>
        <Table striped className="table-data border">
          <thead className="tableHeaderBGColor tablebody">
            <tr>
              <th>Select</th>
              <th>Dwg Name</th>
              <th>Material</th>
              <th>Source</th>
              <th>Process</th>
              <th>Scheduled</th>
              <th>Produced</th>
              <th>Cleared</th>
              <th>Rejected</th>
              <th>Packed</th>
              <th>Deliverd</th>
              <th>In DraftN</th>
              <th>Pack Now</th>
              <th>JW Cost</th>
              <th>Mtrl Cost</th>
            </tr>
          </thead>

          <tbody className="tablebody">
            <tr>
              <td>
                <input type="checkbox" />
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default ScheduleDeatails;
