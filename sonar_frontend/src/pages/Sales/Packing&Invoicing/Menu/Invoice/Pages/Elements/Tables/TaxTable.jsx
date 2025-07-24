import { Table } from "react-bootstrap";

export default function TaxTable(props) {
  return (
    <>
      <div className="px-1">
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
            {props.invTaxData?.map((taxValue, key) => (
              <tr>
                <td>{taxValue.Tax_Name}</td>
                <td>{parseFloat(taxValue.TaxableAmount).toFixed(2)}</td>
                <td>{parseFloat(taxValue.TaxPercent).toFixed(2)} %</td>
                <td>{parseFloat(taxValue.TaxAmt).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
