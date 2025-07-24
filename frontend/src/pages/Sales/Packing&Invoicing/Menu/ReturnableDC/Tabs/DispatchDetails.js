function DispatchDetails({ handleInputChange, formData, updateFormData }) {
  // Effect to update the form data when the component mounts
  const totalTaxAmount = formData.selectedTax.reduce(
    (sum, tax) => sum + parseFloat(tax.TaxAmt || 0),
    0
  );

  return (
    <div>
      <label className="form-label">Dispatch Details</label>

      <div className="row mb-2">
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "10px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Inspected By
          </label>
          <input
            className="in-field mt-1"
            type="text"
            value={formData.inspectedBy}
            name="inspectedBy"
            disabled
          />
        </div>
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "50px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Packed By
          </label>
          <input
            className="in-field mt-1"
            type="text"
            value={formData.packedBy}
            name="packedBy"
            disabled
          />
        </div>
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "70px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Total Weight
          </label>
          <input
            className="in-field mt-1"
            type="text"
            value={formData.totalWeight}
            name="totalWeight"
            disabled
          />
        </div>
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "10px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Scrap Weight
          </label>
          <input
            className="in-field mt-1"
            type="text"
            name="scrapWeight"
            value={formData.scrapWeight}
            onChange={handleInputChange}
            disabled
          />
        </div>
      </div>

      <div className="row mb-2">
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "49px" }}>
          <label className="form-label">Mode</label>

          <select
            id=""
            className="ip-select mt-1"
            value={formData.selectedMode}
            name="selectedMode"
            onChange={handleInputChange}
            disabled={
              formData.dcStatus === "Despatched" ||
              formData.dcStatus === "Closed" ||
              formData.dcStatus === "Cancelled"
            }
          >
            <option disabled hidden value="">
              Select a mode
            </option>
            {formData.modeList.map((mode, index) => (
              <option key={index} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "10px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Veh/Docu Details
          </label>
          <input
            className="in-field mt-1"
            type="text"
            name="vehicleDetails"
            value={formData.vehicleDetails}
            onChange={handleInputChange}
            disabled={
              formData.dcStatus === "Despatched" ||
              formData.dcStatus === "Closed" ||
              formData.dcStatus === "Cancelled"
            }
          />
        </div>
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "10px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Delivery Contact Name
          </label>
          <input
            className="in-field mt-1"
            type="text"
            name="deliveryContactName"
            value={formData.deliveryContactName}
            onChange={handleInputChange}
            disabled={
              formData.dcStatus === "Despatched" ||
              formData.dcStatus === "Closed" ||
              formData.dcStatus === "Cancelled"
            }
          />
        </div>
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "22px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Contact No
          </label>
          <input
            className="in-field mt-1"
            type="text"
            name="deliveryContactNo"
            value={formData.deliveryContactNo}
            onChange={handleInputChange}
            disabled={
              formData.dcStatus === "Despatched" ||
              formData.dcStatus === "Closed" ||
              formData.dcStatus === "Cancelled"
            }
          />
        </div>
      </div>

      <div className="row mb-2">
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "25px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Date Time
          </label>
          <input
            className="in-field mt-1"
            type="text"
            name="dcDate"
            value={formData.dcDate}
            disabled
          />
        </div>
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "52px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Net Value
          </label>
          <input
            className="in-field mt-1"
            type="number"
            value={formData.taxableAmount}
            name="totalValue"
            disabled
          />
        </div>
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "72px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Tax Amount
          </label>
          <input
            className="in-field mt-1"
            type="text"
            value={totalTaxAmount.toFixed(2)}
            name="totalTaxAmount"
            disabled
          />
        </div>
        <div className="d-flex col-md-3 col-sm-12" style={{ gap: "30px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            E Way Ref
          </label>
          <input
            className="in-field mt-1"
            type="text"
            name="eWayRef"
            value={formData.eWayRef}
            onChange={handleInputChange}
            disabled
          />
        </div>
      </div>
    </div>
  );
}

export default DispatchDetails;
