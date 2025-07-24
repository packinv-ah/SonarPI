import { Table } from "react-bootstrap";

function DraftDetailsTable({
  formData,
  handleFieldChange,
  handleRowSelectTable1,
  blockInvalidChar,
  blockInvalidQtyChar,
}) {
  return (
    <div
      style={{
        overflowX: "scroll",
        overflowY: "scroll",
        height: "240px",
      }}
    >
      <Table striped className="table-data border" style={{ border: "1px" }}>
        <thead
          className="tableHeaderBGColor"
          style={{
            textAlign: "center",
            position: "sticky",
            top: "-1px",
          }}
        >
          <tr>
            <th style={{ whiteSpace: "nowrap" }}>Srl</th>
            <th style={{ whiteSpace: "nowrap" }}>Part Name</th>
            <th style={{ whiteSpace: "nowrap" }}>Item Description</th>
            <th style={{ whiteSpace: "nowrap" }}>Material</th>
            <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
            <th style={{ whiteSpace: "nowrap" }}>Returned</th>
            <th style={{ whiteSpace: "nowrap" }}>UOM</th>
            <th style={{ whiteSpace: "nowrap" }}>Unit Rate</th>
            <th style={{ whiteSpace: "nowrap" }}>Total Weight</th>
            <th style={{ whiteSpace: "nowrap" }}>Value</th>
            <th style={{ whiteSpace: "nowrap" }}>Class</th>
          </tr>
        </thead>
        <tbody>
          {formData.tableData?.map((data, index) => (
            <tr
              key={index}
              onClick={() => handleRowSelectTable1(data.DC_Inv_Srl)}
              className={`${
                data.DC_Inv_Srl === formData.selectedRow1
                  ? "selectedRowClr"
                  : parseInt(data.Qty, 10) - parseInt(data.QtyReturned, 10) !==
                    0
                  ? "rowColor"
                  : "rowColorGreen"
              }`}
              style={{ cursor: "pointer" }}
            >
              <td>{data.DC_Inv_Srl}</td>
              <td>{data.Dwg_Code}</td>
              <td>{data.Dwg_No}</td>
              <td>{data.Material}</td>
              <td>
                <input
                  type="number"
                  value={data.Qty}
                  onChange={(e) =>
                    handleFieldChange(index, "Qty", e.target.value)
                  }
                  onKeyDown={blockInvalidQtyChar}
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                  disabled={
                    formData.dcStatus === "Despatched" ||
                    formData.dcStatus === "Cancelled" ||
                    formData.dcStatus === "Closed"
                  }
                  autoComplete="off"
                />
              </td>
              <td>{data.QtyReturned}</td>
              <td>{data.UOM}</td>
              <td>
                <input
                  type="number"
                  value={data.Unit_Rate}
                  onChange={(e) =>
                    handleFieldChange(index, "Unit_Rate", e.target.value)
                  }
                  onKeyDown={blockInvalidChar}
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                  disabled={
                    formData.dcStatus === "Despatched" ||
                    formData.dcStatus === "Cancelled" ||
                    formData.dcStatus === "Closed"
                  }
                  autoComplete="off"
                />
              </td>

              <td>
                <input
                  type="number"
                  value={data.DC_Srl_Wt}
                  onChange={(e) =>
                    handleFieldChange(index, "DC_Srl_Wt", e.target.value)
                  }
                  onKeyDown={blockInvalidChar}
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                  disabled={
                    formData.dcStatus === "Despatched" ||
                    formData.dcStatus === "Cancelled" ||
                    formData.dcStatus === "Closed"
                  }
                  autoComplete="off"
                />
              </td>

              <td>{data.DC_Srl_Amt}</td>
              <td>{data.Excise_CL_no}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default DraftDetailsTable;
