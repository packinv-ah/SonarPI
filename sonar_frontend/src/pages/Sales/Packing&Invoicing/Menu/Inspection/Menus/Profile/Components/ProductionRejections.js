import Table from "react-bootstrap/Table";

function ProductionRejections() {
  return (
    <div>
      <div className="row">
        <div className="col-md-6 col-sm-12">
          <div style={{ height: "400px", overflowY: "scroll" }}>
            <Table striped className="table-data border">
              <thead className="tableHeaderBGColor">
                <tr>
                  <th>Rejection Rprt No</th>
                  <th>Raised by</th>
                  <th>internal</th>
                  <th>Report Date</th>
                  <th>Rejection value</th>
                  <th>Accepted value</th>
                </tr>
              </thead>

              <tbody className="tablebody">
                <tr>
                  <td>asdfghj</td>
                  <td>asdfghj</td>
                  <td>asdfghj</td>
                  <td>asdfghj</td>
                  <td>asdfghj</td>
                  <td>asdfghj</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
        <div className="col-md-6 col-sm-12">
          <div style={{ height: "400px", overflowY: "scroll" }}>
            <Table striped className="table-data border">
              <thead className="tableHeaderBGColor tablebody">
                <tr>
                  <th>Dwg Name</th>
                  <th>Qty Rejected</th>
                  <th>Rejection Reason</th>
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
  );
}

export default ProductionRejections;
