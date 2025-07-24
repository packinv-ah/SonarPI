import { Table } from "react-bootstrap";
import Axios from "axios";
import { apipoints } from "../../../../../api/PackInv_API/ReturnableDC/ReturnableDC";
import { localGST } from "../../../../../../Data/magodData";

// Handles consignee, delivery, and tax info for the DC
function ConsigneeInfo({ handleInputChange, formData, updateFormData }) {
  // Handles tax selection and updates selectedTax in formData
  const handleTaxSelection = async (e) => {
    const selectedTaxDCTaxId = parseInt(e.target.value);
    const taxesWithSelectedDCTaxId = formData.taxDetails.filter(
      (tax) => tax.DCTaxId == selectedTaxDCTaxId
    );

    const newTaxOn = taxesWithSelectedDCTaxId[0].TaxOn.replace(
      /[()]/g,
      ""
    ).split("+");

    const applicableTaxes = [];
    for (let i = 0; i < newTaxOn.length; i++) {
      const element = newTaxOn[i];
      if (parseInt(element) === 1) {
        applicableTaxes.push(...taxesWithSelectedDCTaxId);
      } else {
        formData.taxDetails
          .filter((obj) => obj.DCTaxId === parseInt(element))
          .map((value) => applicableTaxes.push(value));
      }
    }

    const updatedSelectedTax = applicableTaxes.map((tax) => ({
      ...tax,
      TaxableAmount: formData.taxableAmount,
      TaxAmount: parseFloat(
        (formData.taxableAmount * tax.Tax_Percent) / 100
      ).toFixed(2),
    }));

    try {
      const response = await Axios.post(apipoints.taxSelection, {
        selectedTax: updatedSelectedTax,
        dcInvNo: formData.dcInvNo,
      });

      const taxAmtSum = response.data.reduce(
        (sum, tax) => sum + parseFloat(tax.TaxAmt),
        0
      );

      updateFormData((prevData) => ({
        ...prevData,
        taxAmt: taxAmtSum.toFixed(2),
        selectedTax: response.data,
      }));
    } catch (error) {
      console.error("Error updating selectedTax:", error);
    }
  };

  // Clears selectedTax in formData
  const handleDeleteClick = () => {
    updateFormData((prevData) => ({
      ...prevData,
      selectedTax: [],
    }));
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-4 col-sm-12 mt-2">
          <div
            className="ip-box form-bg"
            style={{ height: "240px", padding: "10px" }}
          >
            <h5>
              <label className="form-label">Consignee</label>
            </h5>

            <div className="d-flex" style={{ gap: "10px" }}>
              <label className="form-label">Address</label>
              <textarea
                className="in-field"
                id="exampleFormControlTextarea1"
                rows="3"
                name="custAddress"
                style={{
                  width: "100%",
                  padding: "5px",
                  height: "80px",
                  backgroundColor: "white",
                }}
                value={formData.custAddress}
                onChange={handleInputChange}
                disabled
              ></textarea>
            </div>

            <div className="row">
              <div className="d-flex col-md-6" style={{ gap: "20px" }}>
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="in-field mt-1"
                  name="custCity"
                  value={formData.custCity}
                  onChange={handleInputChange}
                  style={{ backgroundColor: "white" }}
                  disabled
                />
              </div>
              <div className=" d-flex col-md-6" style={{ gap: "31px" }}>
                <label className="form-label">PIN</label>
                <input
                  type="text"
                  className="in-field mt-1"
                  name="custPin"
                  value={formData.custPin}
                  onChange={handleInputChange}
                  style={{ backgroundColor: "white" }}
                  disabled
                />
              </div>

              <div className="d-flex col-md-6" style={{ gap: "14px" }}>
                <label className="form-label">State</label>
                <select
                  id=""
                  className="ip-select in-field mt-1"
                  name="custState"
                  value={formData.custState}
                  onChange={handleInputChange}
                  style={{ backgroundColor: "white" }}
                  disabled
                >
                  <option selected disabled hidden>
                    {formData.custState}
                  </option>
                  {formData.states?.map((st) => (
                    <option value={st.State}>{st.State}</option>
                  ))}
                </select>
              </div>
              <div className="d-flex col-md-6" style={{ gap: "10px" }}>
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                  GST No
                </label>
                <input
                  type="text"
                  className="in-field mt-1"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleInputChange}
                  style={{ backgroundColor: "white" }}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-12 mt-2">
          <div
            className="ip-box form-bg"
            style={{ height: "240px", padding: "10px" }}
          >
            <h5>
              <label className="form-label">Delivery Details</label>
            </h5>

            <div className="d-flex" style={{ gap: "10px" }}>
              <label className="form-label">Address</label>
              <textarea
                id="exampleFormControlTextarea1"
                className="in-field"
                rows="3"
                style={{
                  width: "100%",
                  padding: "5px",
                  height: "80px",
                  backgroundColor: "white",
                }}
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                disabled={
                  formData.dcStatus === "Despatched" ||
                  formData.dcStatus === "Closed" ||
                  formData.dcStatus === "Cancelled"
                }
              ></textarea>
            </div>

            <div className="d-flex" style={{ gap: "25px" }}>
              <label className="form-label">State</label>
              <select
                id=""
                className="ip-select in-field mt-2"
                name="deliveryState"
                onChange={handleInputChange}
                value={formData.deliveryState}
                disabled={
                  formData.dcStatus === "Despatched" ||
                  formData.dcStatus === "Closed" ||
                  formData.dcStatus === "Cancelled"
                }
              >
                <option value="" selected disabled hidden>
                  Select State
                </option>
                {formData.states?.map((st) => (
                  <option>{st.State}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-12 mt-2">
          <div
            className="ip-box form-bg"
            style={{ height: "240px", padding: "10px" }}
          >
            <h5>
              <label className="form-label">Tax Details</label>
            </h5>

            <div className="row">
              <div
                className="d-flex col-md-7 col-sm-12 mt-1"
                style={{ gap: "10px" }}
              >
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                  Select Taxes
                </label>
                <select
                  id=""
                  className="ip-select mt-1 in-fields"
                  name="taxName"
                  onChange={handleTaxSelection}
                  value={formData.selectedTax || ""}
                  disabled={
                    formData.dcStatus === "Despatched" ||
                    formData.dcStatus === "Closed" ||
                    formData.dcStatus === "Cancelled" ||
                    !formData.dcInvNo ||
                    formData.tableData.length === 0 ||
                    formData.gstNo === localGST
                  }
                >
                  <option selected disabled hidden value="">
                    Select Taxes
                  </option>
                  {formData.taxDetails.map((tax, index) => (
                    <option key={index} value={tax.DCTaxId}>
                      {tax.TaxName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-5 col-sm-12">
                <button
                  className={
                    formData.dcStatus === "Despatched" ||
                    formData.dcStatus === "Closed" ||
                    formData.dcStatus === "Cancelled" ||
                    formData.taxDetails.length === 0
                      ? "button-style button-disabled"
                      : "button-style"
                  }
                  onClick={handleDeleteClick}
                  disabled={
                    formData.dcStatus === "Despatched" ||
                    formData.dcStatus === "Closed" ||
                    formData.dcStatus === "Cancelled" ||
                    formData.taxDetails.length === 0
                  }
                >
                  Delete Taxes
                </button>
              </div>
            </div>

            <div
              className="row mt-1"
              style={{
                overflowY: "scroll",
                overflowX: "scroll",
                maxHeight: "200px",
              }}
            >
              <div style={{ height: "120px" }}>
                <Table
                  striped
                  className="table-data border mt-1"
                  style={{ border: "1px" }}
                >
                  <thead className="tableHeaderBGColor">
                    <tr>
                      <th style={{ whiteSpace: "nowrap" }}>Tax</th>
                      <th style={{ whiteSpace: "nowrap" }}>Taxable Amount</th>
                      <th style={{ whiteSpace: "nowrap" }}>Tax Amount</th>
                    </tr>
                  </thead>
                  {formData.dcStatus === "Despatched" ||
                  formData.dcStatus === "Closed" ? (
                    <tbody className="tablebody">
                      {formData.selectedTax.map((tax, index) => (
                        <tr key={index}>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {tax.Tax_Name}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {tax.TaxableAmount}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>{tax.TaxAmt}</td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <tbody className="tablebody">
                      {formData.selectedTax.map((tax, index) => {
                        const taxAmt =
                          (formData.taxableAmount * tax.TaxPercent) / 100;

                        return (
                          <tr key={index}>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {tax.Tax_Name}
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {formData.taxableAmount.toFixed(2)}
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {taxAmt.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsigneeInfo;
