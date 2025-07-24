import { url } from "../../API";

export const apipoints = {
  pnprofileinvoices: `${url}/pnprofile/pnprofileinvoices`,
  aboutInvoicePN: `${url}/pnprofile/aboutInvoicePN`,
  getTaxData: `${url}/pnprofile/getTaxData`,
  getSetRateConsumerData: `${url}/pnprofile/getSetRateConsumerData`,
  updateRatesPN: `${url}/pnprofile/updateRatesPN`,
  updatePNProfileData: `${url}/pnprofile/updatePNProfileData`,
  cancelPN: `${url}/pnprofile/cancelPN`,
  createInvoice: `${url}/invoice/createInvoice`,
  getAllStates: `${url}/invoice/getAllStates`,
};
