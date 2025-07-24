import Table from "react-bootstrap/Table";
import { useNavigate } from "react-router-dom";

function ReadyForPacking() {
  let navigate = useNavigate();

  return (
    <div>
      {" "}
      <div className="row">
        <div className="col-md-4 ">
          <div className="row justify-content-center m-2">
            <button className="button-style" style={{ width: "150px" }}>
              Create Draft Pin
            </button>
          </div>
          <div className="row">
            {" "}
            <div style={{ height: "400px", overflowY: "scroll" }}>
              <Table striped className="table-data border">
                <thead className="tableHeaderBGColor tablebody">
                  <tr>
                    <th>Select</th>
                    <th>Dwg Name</th>
                  </tr>
                </thead>

                <tbody className="tablebody">
                  <tr>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>asdfghj</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </div>
        <div className="col-md-8 col-sm-12">
          <div className="row justify-content-center m-2">
            <button className="button-style " style={{ width: "140px" }}>
              Print Draft PN
            </button>
            <button className="button-style " style={{ width: "150px" }}>
              Delet Draft PN
            </button>
            <button className="button-style " style={{ width: "140px" }}>
              Save Draft PN
            </button>
          </div>
          <div className="row justify-content-center m-2">
            <button className="button-style " style={{ width: "140px" }}>
              Preapare PN
            </button>
            <button className="button-style " style={{ width: "140px" }}>
              Print PN
            </button>
            <button
              className="button-style "
              style={{ width: "140px" }}
              onClick={() => {
                navigate(
                  "/PackingAndInvoices/Service/FindSchedule/InvoiceForm"
                );
              }}
            >
              Open Invoice
            </button>
          </div>
          <div className="row mt-3">
            {" "}
            <div style={{ height: "200px", overflowY: "scroll" }}>
              <Table striped className="table-data border">
                <thead className="tableHeaderBGColor tablebody">
                  <tr>
                    <th>type</th>
                    <th>PN No</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody className="tablebody">
                  <tr>
                    <td>asdfghj</td>
                    <td>asdf</td>
                    <td>asdf</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
          <div className="row">
            {" "}
            <div
              style={{ height: "200px", width: "400px", overflowY: "scroll" }}
            >
              <Table bordered>
                <thead
                  style={{
                    textAlign: "center",
                    position: "sticky",
                    top: "-1px",
                  }}
                >
                  <tr>
                    <th>Dwg No</th>
                    <th>Mtrl</th>
                    <th>Qty</th>
                  </tr>
                </thead>

                <tbody className="tablebody">
                  <tr>
                    <td>asdfghj</td>
                    <td>asdfghj</td>
                    <td>asdfghj</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReadyForPacking;
