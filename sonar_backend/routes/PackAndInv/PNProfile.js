const pnProfileRouter = require("express").Router();
const { misQueryMod } = require("../../helpers/dbconn");
const { errorLog, infoLog } = require("../../helpers/logger");
const validatedNum = require("../../helpers/validateNum");

// Gets register data of one or all customers
pnProfileRouter.post("/pnprofileinvoices", async (req, res, next) => {
  try {
    if (!req.body.custCode) {
      misQueryMod(
        `SELECT
          *,
          DATE_FORMAT(Dc_inv_Date, "%d %M %Y") as Dc_inv_Date,
          DATE_FORMAT(DC_Date, "%d %M %Y") as Printable_DC_Date
        FROM
          magodmis.draft_dc_inv_register
        WHERE
          InvoiceFor = '${req.body.PNType}'
          AND DCStatus = '${req.body.Status}'
        ORDER BY DC_Inv_No DESC`,
        (err, data) => {
          if (err) errorLog("/pnprofileinvoices", err);
          else infoLog("/pnprofileinvoices");
          res.send(data);
        }
      );
    } else {
      misQueryMod(
        `SELECT
          *,
          DATE_FORMAT(Dc_inv_Date, "%d %M %Y") as Dc_inv_Date,
          DATE_FORMAT(DC_Date, "%d %M %Y") as Printable_DC_Date
        FROM
          magodmis.draft_dc_inv_register
        WHERE
          InvoiceFor = '${req.body.PNType}'
          AND DCStatus = '${req.body.Status}'
          AND Cust_code = '${req.body.custcode}'`,
        (err, data) => {
          if (err) errorLog("/pnprofileinvoices", err);
          else infoLog("/pnprofileinvoices");
          res.send(data);
        }
      );
    }
  } catch (error) {
    errorLog("/pnprofileinvoices", error);
    next(error);
  }
});

// Gets data of a particular packing note invoice
pnProfileRouter.post("/aboutInvoicePN", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT 
          *,
          DATE_FORMAT(DespatchDate, '%Y-%m-%dT%H:%i') AS DespatchDate,
          DATE_FORMAT(DC_Date, '%d/%m/%Y') AS Printable_DC_Date,
          DATE_FORMAT(PO_Date, '%d/%m/%Y') AS Printable_PO_Date,
          DATE_FORMAT(Inv_Date, '%d/%m/%Y') AS Printable_Inv_Date,
          DATE_FORMAT(DespatchDate, '%d/%m/%Y %H:%i') AS Printable_DespatchDate,
          magodmis.orderschedule.ScheduleId,
          magodmis.orderschedule.Special_Instructions
      FROM
          magodmis.draft_dc_inv_register
              INNER JOIN
          magodmis.orderschedule ON magodmis.draft_dc_inv_register.ScheduleId = magodmis.orderschedule.ScheduleId
      WHERE
          DC_Inv_No = ${req.body.DCInvNo}`,
      (err, registerData) => {
        if (err) errorLog("/aboutInvoicePN", err);

        try {
          misQueryMod(
            `SELECT
              *
            FROM
              magodmis.draft_dc_inv_details
            WHERE
              DC_Inv_No = ${req.body.DCInvNo}`,
            (err, detailsData) => {
              if (err) errorLog("/aboutInvoicePN", err);
              try {
                misQueryMod(
                  `SELECT
                    *
                  FROM
                    magodmis.dc_inv_taxtable
                  WHERE
                    DC_Inv_No = ${req.body.DCInvNo}`,
                  (err, taxData) => {
                    if (err) errorLog("/aboutInvoicePN", err);
                    else infoLog("/aboutInvoicePN");
                    res.send({
                      registerData: registerData,
                      taxData: taxData,
                      detailsData: detailsData,
                      flag: 1,
                    });
                  }
                );
              } catch (error) {
                errorLog("/aboutInvoicePN", error);
                next(error);
              }
            }
          );
        } catch (error) {
          errorLog("/aboutInvoicePN", error);
          next(error);
        }
      }
    );
  } catch (error) {
    errorLog("/aboutInvoicePN", error);
    next(error);
  }
});

// Gets tax data for a particular customer
pnProfileRouter.post("/getTaxData", async (req, res, next) => {
  // get the cust details
  try {
    misQueryMod(
      `SELECT * FROM magodmis.cust_data where Cust_Code =${req.body.Cust_Code}`,
      (err, custData) => {
        if (err) {
          errorLog("/getTaxData", err);
        } else {
          let query = "";
          if (custData[0].IsGovtOrg) {
            query = `SELECT 
                          *
                      FROM
                          magod_setup.taxdb
                      WHERE
                          EffectiveTO >= NOW() AND TaxID IS NULL`;
          } else if (custData[0].IsForiegn) {
            query = `SELECT 
                          *
                      FROM
                          magod_setup.taxdb
                      WHERE
                          EffectiveTO >= NOW() AND IGST != 0 
                      ORDER BY TaxName DESC
                          `;
          } else if (
            custData[0].GSTNo === null ||
            custData[0].GSTNo === undefined ||
            custData[0].GSTNo === "null" ||
            custData[0].GSTNo === "" ||
            custData[0].GSTNo.length === 0
          ) {
            query = `SELECT 
                          *
                      FROM
                          magod_setup.taxdb
                      WHERE
                          EffectiveTO >= NOW() AND IGST = 0
                              AND UnderGroup != 'INCOMETAX'`;
          } else if (
            parseInt(req.body.unitStateID) != parseInt(custData[0].StateId)
          ) {
            query = `SELECT 
                          *
                      FROM
                          magod_setup.taxdb
                      WHERE
                          EffectiveTO >= NOW() AND IGST != 0
                              AND UnderGroup != 'INCOMETAX'`;
          } else if (req.body.unitGST === custData[0].GSTNo) {
            query = `SELECT 
                          *
                      FROM
                          magod_setup.taxdb
                      WHERE
                          EffectiveTO >= NOW() AND TaxID IS NULL`;
          } else {
            query = `SELECT 
                          *
                      FROM
                          magod_setup.taxdb
                      WHERE
                          EffectiveTO >= NOW() AND IGST = 0
                              AND UnderGroup != 'INCOMETAX'`;
          }

          try {
            misQueryMod(query, (err, data) => {
              if (err) errorLog("/getTaxData", err);
              else infoLog("/getTaxData");
              res.send(data);
            });
          } catch (error) {
            errorLog("/getTaxData", error);
            next(error);
          }
        }
      }
    );
  } catch (error) {
    errorLog("/getTaxData", error);
    next(error);
  }
});

// Gets rates data of a particular schedule
pnProfileRouter.post("/getSetRateConsumerData", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT
            magodmis.draft_dc_inv_register.Cust_Name,
            magodmis.orderschedule.SalesContact,
            magodmis.draft_dc_inv_register.ScheduleId,
            magodmis.draft_dc_inv_register.DC_InvType AS ScheduleType,
            magodmis.draft_dc_inv_register.PO_No,
            magodmis.orderschedule.Schedule_Status,
            magodmis.orderschedule.TgtDelDate
        FROM
            magodmis.draft_dc_inv_register
              INNER JOIN
            magodmis.orderschedule ON magodmis.draft_dc_inv_register.ScheduleId = magodmis.orderschedule.ScheduleId
        WHERE
            magodmis.draft_dc_inv_register.ScheduleId = '${req.body.scheduleId}'`,
      (err, data) => {
        if (err) errorLog("/getSetRateConsumerData", err);
        else infoLog("/getSetRateConsumerData");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/getSetRateConsumerData", err);
    next(error);
  }
});

// Updates rates data of a particular packing note
pnProfileRouter.post("/updateRatesPN", async (req, res, next) => {
  for (let i = 0; i < req.body.newRates.length; i++) {
    const element = req.body.newRates[i];
    let ScheduleID = element.ScheduleID;
    let UnitRate = parseFloat(element.JW_Rate + element.Mtrl_rate).toFixed(2);

    try {
      misQueryMod(
        `UPDATE magodmis.draft_dc_inv_details
            SET
                JW_Rate = ${validatedNum(element.JW_Rate)},
                Mtrl_rate = ${validatedNum(element.Mtrl_rate)},
              
                 Unit_Rate = ${validatedNum(UnitRate)},
                DC_Srl_Amt = ${validatedNum(parseInt(element.Qty) * UnitRate)}

            WHERE
                Draft_dc_inv_DetailsID = ${element.Draft_dc_inv_DetailsID}`,
        (err, response) => {
          if (err) errorLog("/updateRatesPN", err);
        }
      );
    } catch (error) {
      errorLog("/updateRatesPN", err);
      next(error);
    }
  }
  infoLog("/updateRatesPN");
  res.send("Set Rate Successful");
});

// Updates data of a particular packing note
pnProfileRouter.post("/updatePNProfileData", async (req, res, next) => {
  const todayDate = new Date();

  let year = todayDate.getFullYear();
  let month = todayDate.getMonth() + 1;
  let datee = todayDate.getDate();
  let hour = todayDate.getHours();
  let mins = todayDate.getMinutes();

  let formatedTodayDate = `${year}-${month < 10 ? "0" + month : month}-${
    datee < 10 ? "0" + datee : datee
  }T${hour < 10 ? "0" + hour : hour}:${mins < 10 ? "0" + mins : mins}`;

  dispatchDate = req.body.invRegisterData.DespatchDate || formatedTodayDate;

  try {
    misQueryMod(
      `UPDATE magodmis.draft_dc_inv_register
        SET
          PymtAmtRecd = '${req.body.invRegisterData.PymtAmtRecd || ""}',
          PaymentMode =  '${req.body.invRegisterData.PaymentMode || ""}',
          PaymentReceiptDetails =  '${
            req.body.invRegisterData.PaymentReceiptDetails || ""
          }',
          PO_No = '${req.body.invRegisterData.PO_No || ""}',
          Cust_Address = '${req.body.invRegisterData.Cust_Address || ""}',
          Del_Address = '${req.body.invRegisterData.Del_Address || ""}',
          Cust_Place = '${req.body.invRegisterData.Cust_Place || ""}',
          Cust_State = '${req.body.invRegisterData.Cust_State || ""}',
          PIN_Code = '${req.body.invRegisterData.PIN_Code || ""}',
          DespatchDate = '${dispatchDate}',
          TptMode = '${req.body.invRegisterData.TptMode || ""}',
          VehNo = '${req.body.invRegisterData.VehNo || ""}',
          Del_ContactName = '${req.body.invRegisterData.Del_ContactName || ""}',
          Del_ContactNo = '${req.body.invRegisterData.Del_ContactNo || ""}',
          Net_Total = '${validatedNum(req.body.invRegisterData.Net_Total)}',
          TaxAmount = '${parseFloat(req.body.invRegisterData.TaxAmount).toFixed(
            2
          )}',
          Discount = '${validatedNum(req.body.invRegisterData.Discount)}',
          Del_Chg = '${parseFloat(req.body.invRegisterData.Del_Chg).toFixed(
            2
          )}',
          Round_Off = '${validatedNum(req.body.invRegisterData.Round_Off)}',
          GrandTotal = '${validatedNum(req.body.invRegisterData.GrandTotal)}',
          InvTotal = '${validatedNum(req.body.invRegisterData.InvTotal)}',
          Remarks = '${req.body.invRegisterData.Remarks || ""}'
        WHERE
          (DC_Inv_No = ${req.body.invRegisterData.DC_Inv_No})`,
      (err, resp) => {
        if (err) {
          console.error("error in updatePNProfileData", err);
          errorLog("/updatePNProfileData", err);
          res.send({
            status: 0,
            comment: "Some unexpected error came in backend.",
          });
        } else {
          // update orderschedule ...
          try {
            misQueryMod(
              `UPDATE magodmis.orderschedule SET Special_Instructions = '${
                req.body.invRegisterData.Special_Instructions || ""
              }' WHERE (ScheduleId = ${req.body.invRegisterData.ScheduleId})`,
              (err, delTax) => {
                if (err) errorLog("/updatePNProfileData", err);
              }
            );
          } catch (error) {
            errorLog("/updatePNProfileData", err);
            next(error);
          }
          try {
            misQueryMod(
              `DELETE FROM magodmis.dc_inv_taxtable WHERE (Dc_inv_No = ${req.body.invRegisterData.DC_Inv_No})`,
              (err, delTax) => {
                if (err) errorLog("/updatePNProfileData", err);
              }
            );
          } catch (error) {
            errorLog("/updatePNProfileData", err);
            next(error);
          }
          if (req.body.invTaxData?.length > 0) {
            // deleting the existing tax details
            for (let i = 0; i < req?.body?.invTaxData?.length; i++) {
              const element = req?.body?.invTaxData[i];
              // inserting the tax details
              try {
                misQueryMod(
                  `INSERT INTO magodmis.dc_inv_taxtable (Dc_inv_No, DcTaxID, TaxID, Tax_Name, TaxOn, TaxableAmount, TaxPercent, TaxAmt)
                      VALUES (${req.body.invRegisterData.DC_Inv_No}, ${
                    i + 1
                  }, ${element.TaxID}, '${element.Tax_Name}', '${
                    element.TaxOn
                  }', ${parseFloat(element.TaxableAmount).toFixed(
                    2
                  )}, ${parseFloat(element.TaxPercent).toFixed(
                    2
                  )}, ${parseFloat(element.TaxAmt).toFixed(2)})`,
                  (err, insTax) => {
                    if (err) errorLog("/updatePNProfileData", err);
                  }
                );
              } catch (error) {
                errorLog("/updatePNProfileData", error);
                next(error);
              }
            }
            infoLog("/updatePNProfileData");
            res.send({
              status: 1,
              comment: "Successfully saved the invoice.",
            });
          } else {
            infoLog("/updatePNProfileData");
            res.send({
              status: 1,
              comment: "Successfully saved the invoice.",
            });
          }
        }
      }
    );
  } catch (error) {
    errorLog("/updatePNProfileData", error);
    console.error("error in updatePNProfileData", error);
    res.send({
      status: 0,
      comment: "Some unexpected error came in server side.",
    });
  }
});

// Cancels a particular packing note
pnProfileRouter.post("/cancelPN", async (req, res, next) => {
  try {
    misQueryMod(
      `UPDATE magodmis.draft_dc_inv_register SET DCStatus = 'Cancelled' WHERE (DC_Inv_No = '${req.body.invRegisterData.DC_Inv_No}')`,
      (err, cancelPNRegister) => {
        if (err) {
          errorLog("/cancelPN", err);
        } else {
          try {
            misQueryMod(
              `UPDATE magodmis.draft_dc_inv_details SET DespStatus = 'Cancelled' WHERE (DC_Inv_No = '${req.body.invRegisterData.DC_Inv_No}')`,
              (err, cancelPNDetails) => {
                if (err) {
                  errorLog("/cancelPN", err);
                } else {
                  try {
                    misQueryMod(
                      `UPDATE magodmis.material_issue_register SET IVStatus = 'Cancelled' WHERE (Dc_ID = '${req.body.invRegisterData.DC_Inv_No}')`,
                      (err, cancelIssueRegister) => {
                        if (err) {
                          errorLog("/cancelPN", err);
                        } else {
                          try {
                            misQueryMod(
                              `SELECT 
                                    magodmis.orderscheduledetails.SchDetailsID,
                                    magodmis.orderscheduledetails.QtyPacked,
                                    magodmis.draft_dc_inv_details.Qty
                                FROM
                                    magodmis.draft_dc_inv_details
                                        INNER JOIN
                                    magodmis.orderscheduledetails ON magodmis.draft_dc_inv_details.OrderSchDetailsID = magodmis.orderscheduledetails.SchDetailsID
                                WHERE
                                    magodmis.draft_dc_inv_details.DC_Inv_No = '${req.body.invRegisterData.DC_Inv_No}'`,
                              (err, fetchOrderSchAndInvDtls) => {
                                if (err) {
                                  errorLog("/cancelPN", err);
                                } else {
                                  for (
                                    let i = 0;
                                    i < fetchOrderSchAndInvDtls.length;
                                    i++
                                  ) {
                                    const element = fetchOrderSchAndInvDtls[i];

                                    misQueryMod(
                                      `UPDATE magodmis.orderscheduledetails 
                                          SET 
                                              QtyPacked = '${
                                                parseInt(element.QtyPacked) -
                                                parseInt(element.Qty)
                                              }'
                                          WHERE
                                              (SchDetailsID = '${
                                                element.SchDetailsID
                                              }')`,
                                      (err, updateOrdrSchDetails) => {
                                        if (err) {
                                          errorLog("/cancelPN", err);
                                        } else {
                                        }
                                      }
                                    );
                                  }
                                  infoLog("/cancelPN");
                                  res.send({
                                    flag: 1,
                                    message: "Packing Note Cancelled",
                                  });
                                }
                              }
                            );
                          } catch (error) {
                            errorLog("/cancelPN", error);
                            next(error);
                          }
                        }
                      }
                    );
                  } catch (error) {
                    errorLog("/cancelPN", error);
                    next(error);
                  }
                }
              }
            );
          } catch (error) {
            errorLog("/cancelPN", error);
            next(error);
          }
        }
      }
    );
  } catch (error) {
    errorLog("/cancelPN", error);
    next(error);
  }
});

module.exports = pnProfileRouter;
