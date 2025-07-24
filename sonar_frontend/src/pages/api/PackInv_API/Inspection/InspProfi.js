import { url } from "../../API";

export const apipoints = {
  getOrderSchdata: `${url}/inspection/getorderschdata`,
  updateSchDetails: `${url}/inspection/updateSchDetails`,
  testRejectData: `${url}/inspection/testRejectData`,
  testInternalRejectData: `${url}/inspection/testInternalRejectData`,
  RejectionReport: `${url}/inspection/RejectionReport`,
  submitRejectionReport: `${url}/inspection/submitRejectionReport`,
  getOrderDataforFindSchedule: `${url}/inspection/getOrderDataforFindSchedule`,
  postCreateDraftPN: `${url}/inspection/postCreateDraftPN`,
  deleteDraftPN: `${url}/inspection/deleteDraftPN`,
  saveDraftPN: `${url}/inspection/saveDraftPN`,
  preparePN: `${url}/inspection/preparePN`,
  getOrderScheduleData: `${url}/inspection/getOrderScheduleData`,
  insertRunNoRow: `${url}/inspection/insertRunNoRow`,
  insertAndGetRunningNo: `${url}/runningNo/insertAndGetRunningNo`,
};
