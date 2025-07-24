import { useEffect, useState } from "react";
import Axios from "axios";
import { Table } from "react-bootstrap";
import { apipoints } from "../../../../../../../api/PackInv_API/Invoice/Invoice";
import { FaArrowUp } from "react-icons/fa";
import { toast } from "react-toastify";

// Displays and manages the product table for invoice details
export default function ProductTable(props) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const [materialData, setMaterialData] = useState([]);

  useEffect(() => {
    Axios.get(apipoints.allMaterials, {}).then((res) => {
      setMaterialData(res.data);
    });
  }, []);

  // Updates the net total and related fields based on quantity
  const updateQTY = () => {
    let newNetTotal = 0;
    for (let i = 0; i < props.invDetailsData.length; i++) {
      const element = props.invDetailsData[i];
      newNetTotal = parseFloat(newNetTotal) + parseFloat(element.DC_Srl_Amt);
    }
    props.setInvRegisterData({
      ...props.invRegisterData,
      Net_Total: parseFloat(newNetTotal).toFixed(2),
      Discount: "",
      Del_Chg: "",
      TaxAmount: "0.00",
      InvTotal: parseFloat(newNetTotal).toFixed(2),
      GrandTotal: Math.round(parseFloat(newNetTotal)).toFixed(2),
      Round_Off: (
        Math.round(parseFloat(newNetTotal)) - parseFloat(newNetTotal)
      ).toFixed(2),
      AssessableValue: parseFloat(newNetTotal).toFixed(2),
    });
  };

  // Updates the total weight field
  const updateWeight = () => {
    let newTotalWeight = 0;
    for (let i = 0; i < props.invDetailsData.length; i++) {
      const element = props.invDetailsData[i];
      newTotalWeight =
        parseFloat(newTotalWeight) + parseFloat(element.DC_Srl_Wt);
    }

    props.setInvRegisterData({
      ...props.invRegisterData,
      Total_Wt: parseFloat(newTotalWeight).toFixed(3),
    });
  };

  // Updates the net total and related fields based on rate
  const updateRate = () => {
    let newNetTotal = 0;
    for (let i = 0; i < props.invDetailsData.length; i++) {
      const element = props.invDetailsData[i];
      newNetTotal = parseFloat(newNetTotal) + parseFloat(element.DC_Srl_Amt);
    }
    props.setInvRegisterData({
      ...props.invRegisterData,
      Net_Total: parseFloat(newNetTotal).toFixed(2),
      Discount: "",
      Del_Chg: "",
      TaxAmount: "0.00",
      InvTotal: parseFloat(newNetTotal).toFixed(2),
      GrandTotal: Math.round(parseFloat(newNetTotal)).toFixed(2),
      Round_Off: (
        Math.round(parseFloat(newNetTotal)) - parseFloat(newNetTotal)
      ).toFixed(2),
      AssessableValue: parseFloat(newNetTotal).toFixed(2),
    });
  };

  // Handles input changes in the product table rows
  const inputTableRow = (e, key) => {
    props.deleteTaxes();
    if (
      key === props.invDetailsData.length - 1 &&
      !props.invRegisterData?.DC_No &&
      !props.invRegisterData.Iv_Id
    ) {
      props.invDetailsData.push({
        SL_No: props.invDetailsData.length,
        Dwg_No: "",
        Material: "",
        Excise_CL_no: "",
        Qty: "",
        Unit_Wt: "",
        DC_Srl_Wt: "0.000",
        Unit_Rate: "",
        DC_Srl_Amt: "0.00",
        PkngLevel: "Pkng1",
        InspLevel: "Insp1",
      });
      props.setInvDetailsData(props.invDetailsData);
    }

    const newArray = [];

    for (let i = 0; i < props.invDetailsData.length; i++) {
      const element = props.invDetailsData[i];
      element.SL_No = i + 1;
      if (i === key) {
        if (e.target.name === "Material") {
          element.Material = e.target.value || "";
          element.Mtrl = e.target.value || "";
          element.Excise_CL_no =
            materialData.filter((obj) => obj.Material === e.target.value)[0]
              ?.ExciseClNo || "";
        } else if (e.target.name === "Qty") {
          element[e.target.name] = e.target.value;
          element.DC_Srl_Wt = (
            parseFloat(e.target.value || 0) * parseFloat(element.Unit_Wt || 0)
          ).toFixed(3);
          element.DC_Srl_Amt = (
            parseFloat(e.target.value || 0) * parseFloat(element.Unit_Rate || 0)
          ).toFixed(2);
          updateQTY();
        } else if (e.target.name === "Unit_Wt") {
          element[e.target.name] = e.target.value;
          element.DC_Srl_Wt = (
            parseFloat(element.Qty || 0) * parseFloat(e.target.value || 0)
          ).toFixed(3);

          updateWeight();
        } else if (e.target.name === "Unit_Rate") {
          element[e.target.name] = e.target.value;
          element.DC_Srl_Amt = (
            parseFloat(element.Qty || 0) * parseFloat(e.target.value || 0)
          ).toFixed(2);
          updateRate();
        } else {
          element[e.target.name] = e.target.value;
        }
        element.PkngLevel = "Pkng1";
        element.InspLevel = "Insp1";
      }
      newArray.push(element);
    }
    props.setInvDetailsData(newArray);
  };

  // Handles focus event for input fields to validate customer selection
  const inputFocus = () => {
    if (
      props.invRegisterData.Cust_Code === "" ||
      props.invRegisterData.Cust_Code === null ||
      props.invRegisterData.Cust_Code === undefined ||
      props.invRegisterData.Cust_Code === "null" ||
      props.invRegisterData.Cust_Name === "" ||
      props.invRegisterData.Cust_Name === null ||
      props.invRegisterData.Cust_Name === undefined ||
      props.invRegisterData.Cust_Name === "null"
    ) {
      toast.warning("Please select customer");
    }
  };

  // Returns sorted invoice details data
  const sortedData = () => {
    let dataCopy = [...props.invDetailsData];

    if (sortConfig.key) {
      dataCopy.sort((a, b) => {
        if (!parseFloat(a[sortConfig.key]) || !parseFloat(b[sortConfig.key])) {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        } else {
          if (parseFloat(a[sortConfig.key]) < parseFloat(b[sortConfig.key])) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (parseFloat(a[sortConfig.key]) > parseFloat(b[sortConfig.key])) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }
      });
    }

    return dataCopy;
  };

  // Handles sorting request for table columns
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Validates weight input fields
  const weightValidations = (e) => {
    if (
      e.which === 38 ||
      e.which === 40 ||
      ["e", "E", "+", "-"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  // Validates quantity input fields
  const qtyValidations = (e) => {
    if (
      e.which === 38 ||
      e.which === 40 ||
      ["e", "E", "+", "-", "."].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const detailsData = props?.invRegisterData?.DC_No
    ? sortedData()
    : props?.invDetailsData;

  const disableExcise =
    props.invRegisterData?.DC_InvType !== "Misc Sales" ||
    props?.invRegisterData.Inv_No?.length > 0 ||
    props?.invRegisterData?.DCStatus === "Cancelled";

  return (
    <>
      <div className="px-1">
        <Table striped className="table-data border">
          <thead className="tableHeaderBGColor">
            <tr>
              <th>SL No</th>
              <th
                onClick={(e) => {
                  if (props.invRegisterData?.DC_No) {
                    requestSort("Dwg_No");
                  } else {
                    e.preventDefault();
                  }
                }}
                className={props.invRegisterData?.DC_No ? "cursor" : ""}
              >
                Description of Goods
                <FaArrowUp
                  className={
                    sortConfig.key === "Dwg_No"
                      ? sortConfig.direction === "desc"
                        ? "rotateClass"
                        : ""
                      : "displayNoneClass"
                  }
                />
              </th>
              <th
                onClick={(e) => {
                  if (props.invRegisterData?.DC_No) {
                    requestSort("Material");
                  } else {
                    e.preventDefault();
                  }
                }}
                className={props.invRegisterData?.DC_No ? "cursor" : ""}
              >
                Material
                <FaArrowUp
                  className={
                    sortConfig.key === "Material"
                      ? sortConfig.direction === "desc"
                        ? "rotateClass"
                        : ""
                      : "displayNoneClass"
                  }
                />
              </th>
              <th
                onClick={(e) => {
                  if (props.invRegisterData?.DC_No) {
                    requestSort("Excise_CL_no");
                  } else {
                    e.preventDefault();
                  }
                }}
                className={props.invRegisterData?.DC_No ? "cursor" : ""}
              >
                Excise Classification
                <FaArrowUp
                  className={
                    sortConfig.key === "Excise_CL_no"
                      ? sortConfig.direction === "desc"
                        ? "rotateClass"
                        : ""
                      : "displayNoneClass"
                  }
                />
              </th>
              <th
                onClick={(e) => {
                  if (props.invRegisterData?.DC_No) {
                    requestSort("Qty");
                  } else {
                    e.preventDefault();
                  }
                }}
                className={props.invRegisterData?.DC_No ? "cursor" : ""}
              >
                Quantity
                <FaArrowUp
                  className={
                    sortConfig.key === "Qty"
                      ? sortConfig.direction === "desc"
                        ? "rotateClass"
                        : ""
                      : "displayNoneClass"
                  }
                />
              </th>
              <th
                onClick={(e) => {
                  if (props.invRegisterData?.DC_No) {
                    requestSort("Unit_Wt");
                  } else {
                    e.preventDefault();
                  }
                }}
                className={props.invRegisterData?.DC_No ? "cursor" : ""}
              >
                Unit Weight
                <FaArrowUp
                  className={
                    sortConfig.key === "Unit_Wt"
                      ? sortConfig.direction === "desc"
                        ? "rotateClass"
                        : ""
                      : "displayNoneClass"
                  }
                />
              </th>
              <th
                onClick={(e) => {
                  if (props.invRegisterData?.DC_No) {
                    requestSort("DC_Srl_Wt");
                  } else {
                    e.preventDefault();
                  }
                }}
                className={props.invRegisterData?.DC_No ? "cursor" : ""}
              >
                Total Weight
                <FaArrowUp
                  className={
                    sortConfig.key === "DC_Srl_Wt"
                      ? sortConfig.direction === "desc"
                        ? "rotateClass"
                        : ""
                      : "displayNoneClass"
                  }
                />
              </th>
              <th
                onClick={(e) => {
                  if (props.invRegisterData?.DC_No) {
                    requestSort("Unit_Rate");
                  } else {
                    e.preventDefault();
                  }
                }}
                className={props.invRegisterData?.DC_No ? "cursor" : ""}
              >
                Unit Rate
                <FaArrowUp
                  className={
                    sortConfig.key === "Unit_Rate"
                      ? sortConfig.direction === "desc"
                        ? "rotateClass"
                        : ""
                      : "displayNoneClass"
                  }
                />
              </th>
              <th
                onClick={(e) => {
                  if (props.invRegisterData?.DC_No) {
                    requestSort("DC_Srl_Amt");
                  } else {
                    e.preventDefault();
                  }
                }}
                className={props.invRegisterData?.DC_No ? "cursor" : ""}
              >
                Total Amount
                <FaArrowUp
                  className={
                    sortConfig.key === "DC_Srl_Amt"
                      ? sortConfig.direction === "desc"
                        ? "rotateClass"
                        : ""
                      : "displayNoneClass"
                  }
                />
              </th>
            </tr>
          </thead>
          <tbody className="tablebody">
            {detailsData.map((tableData, key) => (
              <>
                <tr>
                  <td>{key + 1}</td>
                  <td>
                    <input
                      value={tableData.Dwg_No}
                      name="Dwg_No"
                      onFocus={(e) => {
                        inputFocus();
                      }}
                      onChange={(e) => {
                        e.target.value = e.target.value || "";
                        if (e.target.value?.length <= 200) {
                          inputTableRow(e, key);
                        } else {
                          toast.warning(
                            "Description of Goods can be only 200 characters"
                          );
                          e.preventDefault();
                        }
                      }}
                      disabled={props.invRegisterData?.DC_No}
                      className={
                        props.invRegisterData?.DC_No
                          ? "input-disabled tableRowInput"
                          : "tableRowInput"
                      }
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    {props.invRegisterData?.DC_InvType === "Misc Sales" ? (
                      <input
                        name="Material"
                        value={tableData.Material}
                        disabled={props.invRegisterData?.DC_No}
                        className={
                          props.invRegisterData?.DC_No
                            ? "input-disabled tableRowInput"
                            : "tableRowInput"
                        }
                        onFocus={(e) => {
                          inputFocus();
                        }}
                        onChange={(e) => {
                          e.target.value = e.target.value || "";
                          if (e.target.value?.length <= 100) {
                            inputTableRow(e, key);
                          } else {
                            toast.warning(
                              "Material can be only 100 characters"
                            );
                            e.preventDefault();
                          }
                        }}
                        autoComplete="off"
                      />
                    ) : (
                      <select
                        value={tableData?.Material}
                        name="Material"
                        id="materialDropdown"
                        style={{
                          fontSize: "inherit",
                        }}
                        onFocus={(e) => {
                          inputFocus();
                        }}
                        onChange={(e) => {
                          inputTableRow(e, key);
                        }}
                        disabled={props.invRegisterData?.DC_No}
                        className={
                          props.invRegisterData?.DC_No
                            ? "input-disabled tableRowInput"
                            : "tableRowInput"
                        }
                      >
                        <option value="" selected disabled hidden>
                          Select material
                        </option>

                        {materialData?.map((material, key) => (
                          <option value={material.Material}>
                            {material.Material}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <input
                      value={tableData.Excise_CL_no}
                      readOnly={disableExcise}
                      disabled={disableExcise}
                      className={
                        disableExcise
                          ? "input-disabled  tableRowInput"
                          : "tableRowInput"
                      }
                      name="Excise_CL_no"
                      onFocus={(e) => {
                        inputFocus();
                      }}
                      onChange={(e) => {
                        e.target.value = e.target.value || "";
                        if (e.target.value?.length <= 45) {
                          inputTableRow(e, key);
                        } else {
                          toast.warning(
                            "Excise classification can be only 45 characters"
                          );
                          e.preventDefault();
                        }
                      }}
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={tableData.Qty}
                      name="Qty"
                      onFocus={(e) => {
                        inputFocus();
                      }}
                      placeholder="0.00"
                      onKeyDown={qtyValidations}
                      onChange={(e) => {
                        if (parseInt(e.target.value) < 0) {
                          e.target.value = parseInt(e.target.value) * -1;
                          toast.warning("Qty can't be negative");
                        }
                        inputTableRow(e, key);
                      }}
                      disabled={props.invRegisterData?.DC_No}
                      className={
                        props.invRegisterData?.DC_No
                          ? "input-disabled tableRowInput"
                          : "tableRowInput"
                      }
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={tableData.Unit_Wt}
                      placeholder="0.00"
                      disabled={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled  tableRowInput"
                          : "tableRowInput"
                      }
                      name="Unit_Wt"
                      onFocus={(e) => {
                        inputFocus();
                      }}
                      onKeyDown={weightValidations}
                      onChange={(e) => {
                        if (parseInt(e.target.value) < 0) {
                          e.target.value = parseInt(e.target.value) * -1;
                          toast.warning("Unit Weight can't be negative");
                        }
                        inputTableRow(e, key);
                      }}
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={tableData.DC_Srl_Wt}
                      disabled
                      className="tableRowInput input-disabled"
                      name="DC_Srl_Wt"
                      onFocus={(e) => {
                        inputFocus();
                      }}
                      onChange={(e) => {
                        inputTableRow(e, key);
                      }}
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={tableData.Unit_Rate}
                      disabled={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                      }
                      className={
                        props.invRegisterData.Inv_No?.length > 0 ||
                        props.invRegisterData.DCStatus === "Cancelled"
                          ? "input-disabled  tableRowInput"
                          : "tableRowInput"
                      }
                      name="Unit_Rate"
                      placeholder="0.00"
                      onFocus={(e) => {
                        inputFocus();
                      }}
                      onKeyDown={weightValidations}
                      onChange={(e) => {
                        if (parseInt(e.target.value) < 0) {
                          e.target.value = parseInt(e.target.value) * -1;
                          toast.warning("Unit Rate can't be negative");
                        }
                        inputTableRow(e, key);
                      }}
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={tableData.DC_Srl_Amt}
                      disabled
                      className="tableRowInput input-disabled"
                      name="DC_Srl_Amt"
                      onFocus={(e) => {
                        inputFocus();
                      }}
                      onChange={(e) => {
                        inputTableRow(e, key);
                      }}
                      autoComplete="off"
                    />
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
