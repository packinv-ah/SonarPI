import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import Axios from "axios";
import { apipoints } from "../../../../../../api/PackInv_API/Invoice/Invoice";

// Displays and manages the modal for adding new goods to invoice
export default function AddGoods(props) {
  const [materialData, setMaterialData] = useState([]);
  const [productDetails, setProductDetails] = useState({});

  // Fetches all available materials for selection
  useEffect(() => {
    Axios.get(apipoints.allMaterials, {}).then((res) => {
      setMaterialData(res.data);
    });
  }, []);

  // Handles cancel action and resets product details
  const handleCancel = () => {
    props.setAddGoodsModal(false);
    setProductDetails({});
  };

  // Handles adding new goods to the invoice details
  const handleAddFunc = () => {
    props.setInvDetailsData([
      ...props.invDetailsData,
      {
        Dwg_No: productDetails.Dwg_No,
        Mtrl: productDetails.Material,
        Material: productDetails.Material,
        Qty: productDetails.Qty,
        Excise_CL_no: productDetails.Excise_CL_no,
        Unit_Wt: productDetails.Unit_Wt,
        DC_Srl_Wt: productDetails.DC_Srl_Wt,
        Unit_Rate: productDetails.Unit_Rate,
        DC_Srl_Amt: productDetails.DC_Srl_Amt,
        PkngLevel: "Pkng1",
        InspLevel: "Insp1",
      },
    ]);
    toast.success("Goods added Successfully");

    let netTotal = 0;
    for (let i = 0; i < props.invDetailsData?.length; i++) {
      const element = props.invDetailsData[i];
      netTotal = parseFloat(netTotal) + parseFloat(element.DC_Srl_Amt);
    }
    netTotal = parseFloat(netTotal) + parseFloat(productDetails.DC_Srl_Amt);
    props.setInvRegisterData({
      ...props.invRegisterData,
      Net_Total: netTotal,
      Discount: 0.0,
      Del_Chg: 0.0,
      TaxAmount: "0.00",
      InvTotal: netTotal,
      GrandTotal: Math.round(parseFloat(netTotal)),
      Round_Off: (
        Math.round(parseFloat(netTotal)) - parseFloat(netTotal)
      ).toFixed(2),
      AssessableValue: netTotal,
    });
    props.setInvTaxData([]);
    document.getElementById("taxDropdown").value = "none";
    handleCancel();
  };

  // Handles input changes for product details
  const inputHandler = (e) => {
    setProductDetails({
      ...productDetails,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Modal
        size="lg"
        show={props.addGoodsModal}
        onHide={() => props.setAddGoodsModal(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Add Goods
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form action="">
            <div className="row">
              <div className="col-md-6">
                <b>Description of Good</b>
                <input
                  defaultValue={productDetails.Dwg_No}
                  name="Dwg_No"
                  onChange={inputHandler}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="col-md-6">
                <b>Material</b>
                <select
                  defaultValue={productDetails.Material}
                  onChange={(e) => {
                    setProductDetails({
                      ...productDetails,
                      Material: materialData[e.target.value].Material,
                      Excise_CL_no: materialData[e.target.value].ExciseClNo,
                    });
                  }}
                  required
                  name="Material"
                  className="ip-select"
                  style={{
                    fontSize: "inherit",
                  }}
                >
                  <option value="none" selected disabled hidden>
                    Select the material
                  </option>
                  {materialData?.map((material, key) => (
                    <option value={key}>{material.Material}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <b>Excise Classification</b>
                <input
                  defaultValue={productDetails.Excise_CL_no}
                  name="Excise_CL_no"
                  onChange={inputHandler}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="col-md-6">
                <b>Quantity</b>
                <input
                  type="number"
                  min="0"
                  defaultValue={productDetails.Qty}
                  name="Qty"
                  onChange={(e) => {
                    setProductDetails({
                      ...productDetails,
                      Qty: e.target.value,
                      DC_Srl_Wt: (
                        parseFloat(productDetails?.Unit_Wt) *
                        parseFloat(e.target.value)
                      ).toFixed(2),
                      DC_Srl_Amt: (
                        parseFloat(productDetails?.Unit_Rate) *
                        parseFloat(e.target.value)
                      ).toFixed(2),
                    });
                  }}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="col-md-6">
                <b>Unit Weight</b>
                <input
                  type="number"
                  min="0"
                  defaultValue={productDetails.Unit_Wt}
                  name="Unit_Wt"
                  onChange={(e) => {
                    setProductDetails({
                      ...productDetails,
                      Unit_Wt: parseFloat(e.target.value).toFixed(2),
                      DC_Srl_Wt: (
                        parseFloat(productDetails?.Qty) *
                        parseFloat(e.target.value)
                      ).toFixed(2),
                    });
                  }}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="col-md-6">
                <b>Total Weight</b>
                <input
                  type="number"
                  min="0"
                  disabled
                  className="input-disabled"
                  value={productDetails?.DC_Srl_Wt}
                  required
                />
              </div>
              <div className="col-md-6">
                <b>Unit Rate</b>
                <input
                  type="number"
                  min="0"
                  defaultValue={productDetails.Unit_Rate}
                  name="Unit_Rate"
                  onChange={(e) => {
                    setProductDetails({
                      ...productDetails,
                      Unit_Rate: parseFloat(e.target.value).toFixed(2),
                      DC_Srl_Amt: (
                        parseFloat(productDetails?.Qty) *
                        parseFloat(e.target.value)
                      ).toFixed(2),
                    });
                  }}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="col-md-6">
                <b>Total Amount</b>
                <input
                  type="number"
                  min="0"
                  disabled
                  className="input-disabled"
                  value={productDetails?.DC_Srl_Amt}
                  required
                />
              </div>
            </div>
            <div className="p-2"></div>
            <div className="px-2">
              <div className="d-flex justify-content-between">
                <button className="button-style m-0 p-0" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  disabled={
                    !(
                      productDetails.Dwg_No?.length > 0 &&
                      productDetails.Material?.length > 0 &&
                      productDetails.Excise_CL_no?.length > 0 &&
                      productDetails.Qty?.length > 0 &&
                      productDetails.Unit_Wt?.length > 0 &&
                      productDetails.DC_Srl_Wt?.length > 0 &&
                      productDetails.Unit_Rate?.length > 0 &&
                      productDetails.DC_Srl_Amt?.length > 0
                    )
                  }
                  className={
                    productDetails.Dwg_No?.length > 0 &&
                    productDetails.Material?.length > 0 &&
                    productDetails.Excise_CL_no?.length > 0 &&
                    productDetails.Qty?.length > 0 &&
                    productDetails.Unit_Wt?.length > 0 &&
                    productDetails.DC_Srl_Wt?.length > 0 &&
                    productDetails.Unit_Rate?.length > 0 &&
                    productDetails.DC_Srl_Amt?.length > 0
                      ? "button-style m-0 p-0"
                      : "button-style button-disabled m-0 p-0"
                  }
                  onClick={(e) => {
                    handleAddFunc();
                    e.preventDefault();
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
