import { useState, useEffect } from "react";
import Axios from "axios";
import { apipoints } from "../../../../../api/PackInv_API/Inspection/InspProfi";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab, Tabs } from "react-bootstrap";
import ScheduleDetails from "./Tabs/ScheduleDetails";
import ReadyForPacking from "./Tabs/ReadyForPacking";
import ProductionRejections from "./Tabs/ProductionRejections";
import FormHeader from "./FormHeader";

// OrderSchDetails manages the main order schedule details view and tab navigation
export default function OrderSchDetails() {
  const nav = useNavigate();
  const location = useLocation();
  const [scheduleID, setScheduleID] = useState(location.state);
  const [headerData, setHeaderData] = useState({});
  const [orderScheduleDetailsData, setOrderScheduleDetailsData] = useState([]);
  const [insAndPack, setInsAndPack] = useState({
    inspectedBy: "",
    packedBy: "",
  });
  const [selectedScheduleDetailsRows, setSelectedScheduleDetailsRows] =
    useState([]);
  const [selectedReadyForPackingRows, setSelectedReadyForPackingRows] =
    useState([]);
  const [invRegisterData, setInvRegisterData] = useState([]);
  const [invDetailsData, setInvDetailsData] = useState([]);
  const [allInvDetailsData, setAllInvDetailsData] = useState([]);
  const [rejectionData, setRejectionData] = useState();

  // Fetches order schedule data and updates state
  const getOrderScheduleData = () => {
    setSelectedScheduleDetailsRows([]);
    setSelectedReadyForPackingRows([]);
    Axios.post(apipoints.getOrderScheduleData, {
      scheduleID: scheduleID,
    }).then((res) => {
      let BillType = "";
      if (res.data.headerData.CreditTerms?.split("Credit").length > 1) {
        BillType = "Credit";
      } else {
        BillType = "Cash";
      }
      setHeaderData({
        ...res.data.headerData,
        BillType: BillType,
        PaymentTerms: res.data.headerData.CreditTerms,
      });
      setOrderScheduleDetailsData(res.data.orderScheduleDetailsData);
      setInvRegisterData(res.data.invRegisterData);
      setAllInvDetailsData(res.data.allInvDetailsData);
      setInsAndPack({
        inspectedBy: res.data.headerData.SalesContact || "",
        packedBy: res.data.headerData.Inspected_By || "",
      });
    });
  };

  // Handles fetching rejection data for the rejection tab
  const handleRejectionTab = () => {
    Axios.post(apipoints.testRejectData, { scheduleID: scheduleID }).then(
      (res) => {
        setRejectionData(res.data);
      }
    );
  };

  useEffect(() => {
    getOrderScheduleData();
  }, []);

  // Selects all rows in the schedule details and ready for packing tables
  const handleSelectAll = () => {
    setSelectedScheduleDetailsRows(orderScheduleDetailsData);
    setSelectedReadyForPackingRows(orderScheduleDetailsData);
  };

  // Reverses the selection of rows in the schedule details table
  const handleReverseSelection = () => {
    if (selectedScheduleDetailsRows.length === 0) {
      handleSelectAll();
    } else {
      const newArray = [];
      for (let i = 0; i < orderScheduleDetailsData.length; i++) {
        const element = orderScheduleDetailsData[i];
        if (!selectedScheduleDetailsRows.includes(element)) {
          newArray.push(element);
        }
      }
      setSelectedScheduleDetailsRows(newArray);
    }
  };

  return (
    <>
      <h4 className="title">Order Schedule Details</h4>
      <div className="row justify-content-last">
        <div className="col-md-12 col-sm-12">
          <button
            className="button-style "
            id="btnclose"
            type="submit"
            onClick={() =>
              nav(
                headerData.Type === "Profile"
                  ? "/PackingAndInvoices/Inspection/Profile/ScheduleList"
                  : headerData.Type === "Service"
                  ? "/PackingAndInvoices/Inspection/Services/ScheduleList"
                  : headerData.Type === "Fabrication"
                  ? "/PackingAndInvoices/Inspection/Fabrication/ScheduleList"
                  : "/PackingAndInvoices"
              )
            }
            style={{ float: "right" }}
          >
            Close
          </button>
        </div>
      </div>
      <div className="mt-1">
        <FormHeader headerData={headerData} />
      </div>
      <div className="">
        <button className="button-style" onClick={handleSelectAll}>
          Select all
        </button>
        <button className="button-style" onClick={handleReverseSelection}>
          Reverse
        </button>
      </div>
      <div className="row">
        <Tabs id="controlled-tab-example" className="mt-2 mb-2 tab_font">
          <Tab eventKey="mat_rece" title="Schedule Details">
            <ScheduleDetails
              orderScheduleDetailsData={orderScheduleDetailsData}
              setOrderScheduleDetailsData={setOrderScheduleDetailsData}
              selectedScheduleDetailsRows={selectedScheduleDetailsRows}
              setSelectedScheduleDetailsRows={setSelectedScheduleDetailsRows}
              headerData={headerData}
              getOrderScheduleData={getOrderScheduleData}
            />
          </Tab>
          <Tab eventKey="mat_retu" title="Ready For Packing">
            <ReadyForPacking
              orderScheduleDetailsData={orderScheduleDetailsData}
              selectedReadyForPackingRows={selectedReadyForPackingRows}
              setSelectedReadyForPackingRows={setSelectedReadyForPackingRows}
              headerData={headerData}
              setHeaderData={setHeaderData}
              invRegisterData={invRegisterData}
              setInvDetailsData={setInvDetailsData}
              invDetailsData={invDetailsData}
              allInvDetailsData={allInvDetailsData}
              insAndPack={insAndPack}
              setInsAndPack={setInsAndPack}
              getOrderScheduleData={getOrderScheduleData}
            />
          </Tab>
          <Tab eventKey="mat_st_posi" title="Production Rejections">
            <ProductionRejections
              orderScheduleDetailsData={orderScheduleDetailsData}
              selectedReadyForPackingRows={selectedReadyForPackingRows}
            />
          </Tab>
        </Tabs>
      </div>
      <div className="p-2"></div>
    </>
  );
}
