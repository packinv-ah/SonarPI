import { Table } from "react-bootstrap";

function ReceiveReturnsTable({ formData, handleRowSelectTable2 }) {
  return (
    <div
      className="mt-2"
      style={{
        overflowX: "scroll",
        overflowY: "scroll",
        height: "215px",
      }}
    >
      <Table striped className="table-data border" style={{ border: "1px" }}>
        <thead className="tableHeaderBGColor">
          <tr>
            <th style={{ whiteSpace: "nowrap" }}>RV No</th>
            <th style={{ whiteSpace: "nowrap" }}>Date</th>
            <th style={{ whiteSpace: "nowrap" }}>Cust Docu Ref</th>
            <th style={{ whiteSpace: "nowrap" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {formData.receiveTable?.map((data, index) => (
            <tr
              key={index}
              onClick={() => handleRowSelectTable2(data.RvID)}
              className={`${
                data.RvID === formData.selectedRow2 ? "selectedRowClr" : ""
              } `}
              style={{ cursor: "pointer" }}
            >
              <td style={{ whiteSpace: "nowrap" }}>{data.RV_No}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                {data.RV_Date
                  ? new Date(data.RV_Date).toLocaleDateString("en-GB")
                  : ""}
              </td>
              <td style={{ whiteSpace: "nowrap" }}>{data.CustDocuNo}</td>
              <td style={{ whiteSpace: "nowrap" }}>{data.RVStatus}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default ReceiveReturnsTable;
