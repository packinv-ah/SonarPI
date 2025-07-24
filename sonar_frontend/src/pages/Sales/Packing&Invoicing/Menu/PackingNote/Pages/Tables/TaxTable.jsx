import { Table } from "react-bootstrap";

export default function TaxTable(props) {
  return (
    <div>
      <Table striped className="table-data border" style={{ border: "1px" }}>
        <thead className="tableHeaderBGColor">
          <tr>
            <th>Tax Name</th>
            <th>Taxable Amount</th>
            <th>Tax Percentage</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody className="tablebody">
          {props.invTaxData?.map((val) => (
            <>
              <tr>
                <td>{val.Tax_Name}</td>
                <td>{parseFloat(val.TaxableAmount).toFixed(2)}</td>
                <td>{parseFloat(val.TaxPercent).toFixed(2)}%</td>
                <td>{parseFloat(val.TaxAmt).toFixed(2)}</td>
              </tr>
            </>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
