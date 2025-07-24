import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import WithNav from "./Layout/WithNav";
import Parentroute from "./Layout/Parentroute";
import Login from "./pages/Auth/Login";
import Home from "./pages/Home";
import HomeOne from "./pages/HomeOne";
import UserRolesModules from "./pages/admin/userrolesmodules";
import CreateUsers from "./pages/admin/createusers";
import MenuRoleMapping from "./pages/admin/menurolemapping";
import SendMail from "./pages/sendmail/sendmails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PNDescription from "./pages/Sales/Packing&Invoicing/Menu/PackingNote/Pages/PNDescription";
import ProfileOpenForm from "./pages/Sales/Packing&Invoicing/Menu/PackingNote/Menus/Profile/ProfileOpenForm";
import MiscOpenForm from "./pages/Sales/Packing&Invoicing/Menu/PackingNote/Menus/Misc/MiscOpenForm";
import ServicesOpenForm from "./pages/Sales/Packing&Invoicing/Menu/PackingNote/Menus/Services/ServicesOpenForm";
import FabricationOpenForm from "./pages/Sales/Packing&Invoicing/Menu/PackingNote/Menus/Fabrication/FabricationOpenForm";
import DCCreateNew from "./pages/Sales/Packing&Invoicing/Menu/ReturnableDC/CreateNew/DCCreateNew";
import DCList from "./pages/Sales/Packing&Invoicing/Menu/ReturnableDC/DCList/DCList";
import CreateNewJobWork from "./pages/Sales/Packing&Invoicing/Menu/ReturnableDC/Modals/CreateNewJobWork";
import DCListCreated from "./pages/Sales/Packing&Invoicing/Menu/ReturnableDC/DCList/DCListCreated";
import DCListDespatched from "./pages/Sales/Packing&Invoicing/Menu/ReturnableDC/DCList/DCListDespatched";
import DCListClosed from "./pages/Sales/Packing&Invoicing/Menu/ReturnableDC/DCList/DCListClosed";
import DCListAll from "./pages/Sales/Packing&Invoicing/Menu/ReturnableDC/DCList/DCListAll";
import OrderSchDetails from "./pages/Sales/Packing&Invoicing/Menu/Inspection/InspectionPages/OrderSchDetails";
import InternalRejectionModal from "./pages/Sales/Packing&Invoicing/Menu/Inspection/InspectionPages/Modals/InternalRejectionModal";
import MiscCreateNew from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/MiscInvoice/MiscCreateNew";
import MiscPNList from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/MiscInvoice/MiscPNList";
import MiscInvoiceList from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/MiscInvoice/MiscInvoiceList";
import MSIScrap from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/MaterialScrapInvoice/MSIScrap";
import MSIMaterialReturn from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/MaterialScrapInvoice/MSIMaterialReturn";
import MSIPNListScrap from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/MaterialScrapInvoice/PNList/MSIPNListScrap";
import MSIPNListMaterial from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/MaterialScrapInvoice/PNList/MSIPNListMaterial";
import MSIInvoiceList from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/MaterialScrapInvoice/MSIInvoiceList";
import MSICreateNew from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/MaterialScrapInvoice/MSICreateNew";
import ServicesInvoice from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/ServicesInvoice/ServicesInvoice";
import SalesInvoice from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/SalesInvoice/SalesInvoice";
import FabricationInvoice from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Menus/FabricationInvoice/FabricationInvoice";
import InvoiceDetails from "./pages/Sales/Packing&Invoicing/Menu/Invoice/Pages/InvoiceDetails/InvoiceDetails";
import InspProfileScheduleList from "./pages/Sales/Packing&Invoicing/Menu/Inspection/Menus/Profile/InspProfileScheduleList";
import InspProfileFindSchedule from "./pages/Sales/Packing&Invoicing/Menu/Inspection/Menus/Profile/InspProfileFindSchedule";
import InspFabricationScheduleList from "./pages/Sales/Packing&Invoicing/Menu/Inspection/Menus/Fabrication/InspFabricationScheduleList";
import InspFabricationFindSchedule from "./pages/Sales/Packing&Invoicing/Menu/Inspection/Menus/Fabrication/InspFabricationFindSchedule";
import InspServiceScheduleList from "./pages/Sales/Packing&Invoicing/Menu/Inspection/Menus/Service/InspServiceScheduleList";
import InspServiceFindSchedule from "./pages/Sales/Packing&Invoicing/Menu/Inspection/Menus/Service/InspServiceFindSchedule";

// Main application component with all routes
function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-center" />
      <Routes>
        <Route element={<Login />} path="/" />
        <Route path="/home" element={<Home />} />
        <Route path="/salesHome" element={<HomeOne />} />
        <Route element={<WithNav />}>
          <Route exact path="/mailer" element={<SendMail />} />
          <Route path="/admin" element={<Parentroute />}>
            <Route index={true} />
            <Route path="roles" element={<UserRolesModules />} />
            <Route path="mapping" element={<MenuRoleMapping />} />
            <Route path="users" element={<CreateUsers />} />
          </Route>
          <Route path="/PackingAndInvoices" element={<Parentroute />}>
            <Route index={true} />
            <Route path="Inspection">
              <Route path="Profile">
                <Route
                  path="ScheduleList"
                  element={<InspProfileScheduleList />}
                />
                <Route
                  path="FindSchedule"
                  element={<InspProfileFindSchedule />}
                />
              </Route>
              <Route path="Fabrication">
                <Route
                  path="ScheduleList"
                  element={<InspFabricationScheduleList />}
                />
                <Route
                  path="FindSchedule"
                  element={<InspFabricationFindSchedule />}
                />
              </Route>
              <Route path="Services">
                <Route
                  path="ScheduleList"
                  element={<InspServiceScheduleList />}
                />
                <Route
                  path="FindSchedule"
                  element={<InspServiceFindSchedule />}
                />
              </Route>
              <Route
                path="OrderScheduleDetails"
                element={<OrderSchDetails />}
              ></Route>
              <Route
                path="InternalRejectionForm"
                element={<InternalRejectionModal />}
              />
            </Route>
            <Route path="PackingNote">
              <Route index={true} />
              <Route path="ProfileOpenForm" element={<ProfileOpenForm />} />
              <Route path="Description" element={<PNDescription />} />
              <Route path="MiscOpenForm" element={<MiscOpenForm />} />
              <Route path="ServicesOpenForm" element={<ServicesOpenForm />} />
              <Route
                path="FabricationOpenForm"
                element={<FabricationOpenForm />}
              />
            </Route>
            <Route path="Invoice">
              <Route index={true} />
              <Route path="MiscInvoice">
                <Route index={true} />
                <Route path="CreateNew" element={<MiscCreateNew />} />
                <Route path="PNList" element={<MiscPNList />} />
                <Route path="InvoiceList" element={<MiscInvoiceList />} />
              </Route>
              <Route path="MaterialScrapInvoice">
                <Route index={true} />
                <Route path="Scrap" element={<MSIScrap />} />
                <Route path="MaterialReturn" element={<MSIMaterialReturn />} />
                <Route path="PNList">
                  <Route index={true} />
                  <Route path="Scrap" element={<MSIPNListScrap />} />
                  <Route path="Material" element={<MSIPNListMaterial />} />
                </Route>
                <Route path="InvoiceList" element={<MSIInvoiceList />} />
                <Route path="CreateNew" element={<MSICreateNew />} />
              </Route>
              <Route path="ServicesInvoice" element={<ServicesInvoice />} />
              <Route path="SalesInvoice" element={<SalesInvoice />} />
              <Route
                path="FabricationInvoice"
                element={<FabricationInvoice />}
              />
              <Route path="InvoiceDetails" element={<InvoiceDetails />} />
            </Route>
            <Route path="ReturnableDC">
              <Route index={true} />
              <Route path="DCCreateNew" element={<DCCreateNew />} />
              <Route path="JobWork" element={<CreateNewJobWork />} />
              <Route path="DCList" element={<DCList />} />
              <Route path="DCList">
                <Route index={true} />
                <Route path="DCListClosed" element={<DCListClosed />} />
                <Route path="DCListCreated" element={<DCListCreated />} />
                <Route path="DCListDispatched" element={<DCListDespatched />} />
                <Route path="DCListAll" element={<DCListAll />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
