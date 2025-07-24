import React, { createContext, useContext, useState } from "react";
import { lazerData } from "../Data/magodData";

const PackAndInvContext = createContext();

// Provider component for PackAndInvContext
export const PackAndInvContextProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    unitName: lazerData.UnitName,
    dcNo: "",
    dcInvNo: "",
    dcDate: "",
    dcType: "Returnable DC",
    dcStatus: "Draft",
    reviewPeriod: "FinanceYear",
    resetValue: 0,
    voucherNoLenght: 4,
    finYear: "",
    customerNames: [],
    selectedCustomer: null,
    custCode: "",
    custName: "",
    reference: "",
    custData: "",
    custAddress: "",
    custState: "",
    custCity: "",
    custPin: "",
    states: [],
    gstNo: "",
    deliveryAddress: "Consignee Address",
    deliveryState: "",
    custStateId: "",
    delStateId: "",
    taxDetails: [],
    dcListTaxes: [],
    tableData: [],
    selectedRow: null,
    taxableAmount: 0,
    taxAmt: 0,
    selectedTax: [],
    selectedRowData: {},
    dcCancel: "",

    // Add New
    partName: "",
    itemDescription: "",
    material: "",
    quantity: 0,
    uom: "",
    uomList: ["Unit", "Kg", "Mtr", "Ltr"],
    unitRate: 0,
    totalValue: 0,
    hsnCode: "",
    weight: 0,
    returned: 0,
    totalWeight: 0,
    taxAmount: 0,
    materials: [],
    exciseClNos: [],
    srlType: "Sheets",
    tableData: [],
    rvId: "",

    // Dispatch Details
    inspectedBy: "",
    packedBy: "",
    modeList: ["By Road", "By Hand", "By Air", "By Courier"],
    selectedMode: "",
    scrapWeight: 0,
    vehicleDetails: "",
    eWayRef: "",

    // Job Work Goods Receipt Voucher
    rvId: "",
    receiptDate: "",
    voucherNo: "",
    rvNo: "",
    rvDate: "",
    rvCustCode: "",
    rvCustomer: "",
    CustDocuNo: "",
    ewayBillNo: "",
    custKSTNo: "",
    CustGSTNo: "",
    RVStatus: "",
    rvTotalWeight: 0,
    UpDated: 0,
    Type: "",
    Ref_VrId: "",
    Ref_VrNo: "",
    CancelReason: "",
    firstTable: [],
    firstTableArray: [],
    secondTable: [],
    secondTableArray: [],
    receiveTable: [],

    // DCList
    draftTable: [],
    despactedTable: [],
    closedTable: [],
    allTable: [],
    dcListData: {},
  });

  // Function to update formData state
  const updateFormData = (data) => {
    setFormData(data);
  };

  return (
    <PackAndInvContext.Provider
      value={{
        formData,
        updateFormData,
      }}
    >
      {children}
    </PackAndInvContext.Provider>
  );
};

// Custom hook to use PackAndInvContext
export const usePackAndInvContext = () => useContext(PackAndInvContext);
