const InvoiceRouter = require("express").Router();
const { misQueryMod } = require("../../helpers/dbconn");
const { errorLog, infoLog } = require("../../helpers/logger");

// Gets all customer data
InvoiceRouter.get("/getAllCust", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT * FROM magodmis.cust_data order by Cust_name`,
      (err, data) => {
        if (err) errorLog("/getAllCust", err);
        else infoLog("/getAllCust");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/getAllCust", error);
    next(error);
  }
});

// Gets customer data of a particular packing note
InvoiceRouter.post("/getCustAccnToListData", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT 
            magodmis.cust_data.*
        FROM
            magodmis.draft_dc_inv_register
                INNER JOIN
            magodmis.cust_data ON magodmis.draft_dc_inv_register.Cust_Code = magodmis.cust_data.Cust_Code
        WHERE
            InvoiceFor = '${req.body.PNList}'
                AND DCStatus = '${req.body.Status}'
        GROUP BY magodmis.cust_data.Cust_Code
        ORDER BY magodmis.cust_data.Cust_name`,
      (err, data) => {
        if (err) errorLog("/getCustAccnToListData", err);
        else infoLog("/getCustAccnToListData");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/getCustAccnToListData", error);
    next(error);
  }
});

// Gets all materials data
InvoiceRouter.get("/allMaterials", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT * FROM magodmis.mtrl_typeslist ORDER BY Material`,
      (err, data) => {
        if (err) errorLog("/getCustAccnToListData", err);
        else infoLog("/getCustAccnToListData");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/getCustAccnToListData", error);
    next(error);
  }
});

// Gets all states data
InvoiceRouter.get("/getAllStates", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT * FROM magod_setup.state_codelist ORDER BY State`,
      (err, states) => {
        if (err) errorLog("/getAllStates", err);
        else infoLog("/getAllStates");
        res.send(states);
      }
    );
  } catch (error) {
    errorLog("/getAllStates", error);
    next(error);
  }
});

// Creates new packing note
InvoiceRouter.post("/createPN", async (req, res, next) => {
  const DCStatus = "Packed";

  var BillType = "Cash";

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

  var DC_Date = todayDate.toISOString().split("T")[0];

  const getYear =
    todayDate.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  const yearParts = getYear.split("-");
  const startYearShort = yearParts[0].slice(-2);
  const endYearShort = yearParts[1].slice(-2);
  const finYear = `${startYearShort}/${endYearShort}`;

  try {
    misQueryMod(
      `SELECT 
          *
        FROM
          magod_setup.year_prefix_suffix
        WHERE
          UnitName = '${req.body.runningNoData.UnitName}' AND SrlType = '${req.body.runningNoData.SrlType}'`,
      (err, yearPrefixSuffixData) => {
        if (err) {
          errorLog("/createPN", err);
        } else {
          misQueryMod(
            `SELECT * FROM magod_setup.magod_runningno WHERE Id = '${req.body.runningNoData.Id}'`,
            (err, runningNoData) => {
              if (err) {
                errorLog("/createPN", err);
              } else {
                let newRunningNo = (
                  parseInt(runningNoData[0].Running_No) + 1
                ).toString();

                for (let i = 0; i < runningNoData[0].Length; i++) {
                  if (newRunningNo.length < runningNoData[0].Length) {
                    newRunningNo = 0 + newRunningNo;
                  }
                }
                let newRunningNoWithPS =
                  (yearPrefixSuffixData[0].Prefix || "") +
                  newRunningNo +
                  (yearPrefixSuffixData[0].Suffix || "");

                try {
                  misQueryMod(
                    `insert into magodmis.draft_dc_inv_register(DC_InvType, InvoiceFor, OrderScheduleNo, DC_No, DC_Date, DC_Fin_Year, PymtAmtRecd, PaymentMode, PaymentReceiptDetails, Cust_Code, Cust_Name, Cust_Address, Cust_Place, Cust_State, Cust_StateId, PIN_Code, Del_Address, GSTNo, PO_No, PO_Date, Net_Total, TptCharges, Discount, AssessableValue, TaxAmount, Del_Chg, InvTotal, Round_Off, GrandTotal, Total_Wt, DCStatus, DespatchDate, TptMode, VehNo, Remarks, PO_Value, PaymentTerms, BillType, PAN_No, Del_ContactName, Del_ContactNo) values(
                    '${req.body.invRegisterData.DC_InvType || ""}', '${
                      req.body.invRegisterData.InvoiceFor || ""
                    }', '${
                      req.body.invRegisterData.InvoiceFor || ""
                    }', '${newRunningNoWithPS}', '${DC_Date}', '${finYear}', '${
                      req.body.invRegisterData.PymtAmtRecd || 0.0
                    }', '${req.body.invRegisterData.PaymentMode || ""}', '${
                      req.body.invRegisterData.PaymentReceiptDetails || ""
                    }', '${req.body.invRegisterData.Cust_Code}', '${
                      req.body.invRegisterData.Cust_Name
                    }', '${req.body.invRegisterData.Cust_Address || ""}', '${
                      req.body.invRegisterData.Cust_Place || ""
                    }', '${req.body.invRegisterData.Cust_State || ""}', '${
                      req.body.invRegisterData.Cust_StateId || "00"
                    }', '${req.body.invRegisterData.PIN_Code || ""}', '${
                      req.body.invRegisterData.Del_Address || ""
                    }', '${req.body.invRegisterData.GSTNo || ""}', '${
                      req.body.invRegisterData.PO_No || ""
                    }', '${DC_Date}', '${
                      req.body.invRegisterData.Net_Total || 0.0
                    }', '${req.body.invRegisterData.TptCharges || 0.0}', '${
                      req.body.invRegisterData.Discount || 0.0
                    }', '${
                      req.body.invRegisterData.AssessableValue || 0.0
                    }', '${req.body.invRegisterData.TaxAmount || 0.0}', '${
                      req.body.invRegisterData.Del_Chg || 0.0
                    }', '${req.body.invRegisterData.InvTotal || 0.0}', '${
                      req.body.invRegisterData.Round_Off || 0.0
                    }', '${req.body.invRegisterData.GrandTotal || 0.0}', '${
                      req.body.invRegisterData.Total_Wt || 0.0
                    }', '${DCStatus}', '${dispatchDate}', '${
                      req.body.invRegisterData.TptMode || ""
                    }', '${req.body.invRegisterData.VehNo || ""}', '${
                      req.body.invRegisterData.Remarks || ""
                    }', '${req.body.invRegisterData.PO_Value || 0.0}', '${
                      req.body.invRegisterData.PaymentTerms || ""
                    }', '${req.body.invRegisterData.BillType || BillType}', '${
                      req.body.invRegisterData.PAN_No || ""
                    }', '${req.body.invRegisterData.Del_ContactName || ""}', '${
                      req.body.invRegisterData.Del_ContactNo || ""
                    }'
                  )
                `,
                    (err, registerData) => {
                      if (err) {
                        errorLog("/createPN", err);
                        console.error("errrr", err);
                      } else {
                      }

                      try {
                        misQueryMod(
                          `UPDATE magodmis.material_issue_register
                        SET
                            PkngDcNo = '${newRunningNoWithPS}',
                            PkngDCDate = NOW(),
                            IVStatus = '${DCStatus}',
                            Dc_ID = '${registerData.insertId}'
                        WHERE
                            (Iv_Id = '${req.body.invRegisterData.Iv_Id}')`,
                          (err, updateMtrlIssueRegister) => {
                            if (err) errorLog("/createPN", err);
                          }
                        );
                      } catch (error) {
                        errorLog("/createPN", error);
                        next(error);
                      }

                      let flag = 0;
                      for (let i = 0; i < req.body.invDetailsData.length; i++) {
                        const element = req.body.invDetailsData[i];
                        try {
                          misQueryMod(
                            `insert into magodmis.draft_dc_inv_details(DC_Inv_No, DC_Inv_Srl, Cust_Code, Dwg_No, Mtrl, Material, Qty, Unit_Wt, DC_Srl_Wt, Unit_Rate, DC_Srl_Amt, Excise_CL_no, DespStatus) values(${
                              registerData.insertId
                            }, ${i + 1}, '${
                              req.body.invRegisterData.Cust_Code
                            }', '${element.Dwg_No}', '${element.Mtrl}', '${
                              element.Material
                            }', '${element.Qty || 0}', '${
                              element.Unit_Wt || 0.0
                            }', '${element.DC_Srl_Wt || 0.0}', '${
                              element.Unit_Rate || 0.0
                            }', '${element.DC_Srl_Amt || 0.0}', '${
                              element.Excise_CL_no
                            }', '${DCStatus}')`,
                            (err, detailsData) => {
                              if (err) {
                                errorLog("/createPN", err);
                                console.error("errr", err);
                              } else {
                              }
                            }
                          );
                        } catch (error) {
                          errorLog("/createPN", error);
                          next(error);
                        }
                      }
                      if (req.body.invTaxData?.length > 0) {
                        for (let i = 0; i < req.body.invTaxData.length; i++) {
                          const element = req.body.invTaxData[i];
                          try {
                            misQueryMod(
                              `INSERT INTO magodmis.dc_inv_taxtable (Dc_inv_No, DcTaxID, TaxID, Tax_Name, TaxOn, TaxableAmount, TaxPercent, TaxAmt) values('${
                                registerData.insertId
                              }', '${i + 1}', '${element.TaxID}', '${
                                element.Tax_Name
                              }', '${element.TaxOn}', '${
                                element.TaxableAmount
                              }', '${element.TaxPercent}', '${
                                element.TaxAmt
                              }')`,
                              (err, taxData) => {
                                if (err) errorLog("/createPN", err);
                              }
                            );
                          } catch (error) {
                            errorLog("/createPN", error);
                            next(error);
                          }
                        }
                        flag = 1;
                      } else {
                        flag = 1;
                      }
                      if (flag === 1) {
                        try {
                          misQueryMod(
                            `SELECT
                                  *,
                                  DATE_FORMAT(DespatchDate, '%Y-%m-%dT%H:%i') AS DespatchDate,
                                  DATE_FORMAT(DC_Date, '%d/%m/%Y') AS DC_Date,
                                  DATE_FORMAT(DC_Date, '%d/%m/%Y') AS Printable_DC_Date,
                                  DATE_FORMAT(PO_Date, '%d/%m/%Y') AS Printable_PO_Date,
                                  DATE_FORMAT(Inv_Date, '%d/%m/%Y') AS Inv_Date,
                                  DATE_FORMAT(Inv_Date, '%d/%m/%Y') AS Printable_Inv_Date,
                                  DATE_FORMAT(DespatchDate, '%d/%m/%Y %H:%i') AS Printable_DespatchDate
                                FROM
                                  magodmis.draft_dc_inv_register
                                WHERE
                                      magodmis.draft_dc_inv_register.DC_Inv_No = ${registerData?.insertId}`,
                            (err, invRegisterData) => {
                              if (err) {
                                errorLog("/createPN", err);
                              } else {
                                misQueryMod(
                                  `UPDATE magod_setup.magod_runningno SET Running_No = '${parseInt(
                                    newRunningNo
                                  )}', Prefix = '${
                                    yearPrefixSuffixData[0].Prefix || ""
                                  }', Suffix = '${
                                    yearPrefixSuffixData[0].Suffix || ""
                                  }' WHERE (Id = '${
                                    req.body.runningNoData.Id
                                  }')`,
                                  (err, updateRunningNo) => {
                                    if (err) {
                                      errorLog("/createPN", err);
                                    } else {
                                      infoLog("/createPN");
                                      res.send({
                                        flag: 1,
                                        message: "PN Created",
                                        invRegisterData: invRegisterData,
                                      });
                                    }
                                  }
                                );
                              }
                            }
                          );
                        } catch (error) {
                          errorLog("/createPN", error);
                          next(error);
                        }
                      } else if (flag === 0) {
                        errorLog("/createPN", "Error in Backend");
                        res.send({
                          message: "Error in Backend",
                          flag: 0,
                        });
                      } else {
                        errorLog(
                          "/createPN",
                          "Uncaught Error, Check with backend"
                        );
                        res.send({
                          message: "Uncaught Error, Check with backend",
                          flag: 0,
                        });
                      }
                    }
                  );
                } catch (error) {
                  errorLog("/createPN", error);
                  next(error);
                }
              }
            }
          );
        }
      }
    );
  } catch (error) {
    errorLog("/createPN", error);
    next(error);
  }
});

// Gets packing note data of a particular category
InvoiceRouter.post("/getListData", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT 
          *,
          DATE_FORMAT(DC_Date, "%d %M %Y") AS Printable_DC_Date
        FROM
          magodmis.draft_dc_inv_register
        WHERE
          InvoiceFor = '${req.body.PNList}'
        AND DCStatus = '${req.body.Status}'
          ORDER BY DC_Inv_No DESC`,
      (err, data) => {
        if (err) errorLog("/getListData", err);
        else infoLog("/getListData");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/getListData", error);
    next(error);
  }
});

// Gets register,details amnd tax data of a particular invoice
InvoiceRouter.post("/invoiceDetails", async (req, res, next) => {
  if (req.body?.DCInvNo) {
    try {
      misQueryMod(
        `SELECT
            *,
            DATE_FORMAT(DespatchDate, '%Y-%m-%dT%H:%i') AS DespatchDate,
            DATE_FORMAT(DC_Date, '%d/%m/%Y') AS DC_Date,
            DATE_FORMAT(DC_Date, '%d/%m/%Y') AS Printable_DC_Date,
            DATE_FORMAT(PO_Date, '%d/%m/%Y') AS Printable_PO_Date,
            DATE_FORMAT(Inv_Date, '%d/%m/%Y') AS Inv_Date,
            DATE_FORMAT(Inv_Date, '%d/%m/%Y') AS Printable_Inv_Date,
            DATE_FORMAT(DespatchDate, '%d/%m/%Y %H:%i') AS Printable_DespatchDate
          FROM
            magodmis.draft_dc_inv_register
          WHERE
            DC_Inv_No = ${req.body.DCInvNo}`,
        (err, registerData) => {
          if (err) errorLog("/invoiceDetails", err);

          try {
            misQueryMod(
              `SELECT
                *
              FROM
                magodmis.draft_dc_inv_details
              WHERE
                DC_Inv_No = ${req.body.DCInvNo}`,
              (err, detailsData) => {
                if (err) errorLog("/invoiceDetails", err);
                try {
                  misQueryMod(
                    `SELECT
                        *
                      FROM
                        magodmis.dc_inv_taxtable
                      WHERE
                        DC_Inv_No = ${req.body.DCInvNo}`,
                    (err, taxData) => {
                      if (err) errorLog("/invoiceDetails", err);
                      else infoLog("/invoiceDetails");
                      res.send({
                        registerData: registerData,
                        taxData: taxData,
                        detailsData: detailsData,
                        flag: 1,
                      });
                    }
                  );
                } catch (error) {
                  errorLog("/invoiceDetails", error);
                  next(error);
                }
              }
            );
          } catch (error) {
            errorLog("/invoiceDetails", error);
            next(error);
          }
        }
      );
    } catch (error) {
      errorLog("/invoiceDetails", error);
      next(error);
    }
  }
});

// Gets tax data for a particular customer
InvoiceRouter.post("/getTaxDataInvoice", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT * FROM magodmis.cust_data where Cust_Code =${req.body.Cust_Code}`,
      (err, custData) => {
        if (err) {
          errorLog("/getTaxDataInvoice", err);
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
              if (err) errorLog("/getTaxDataInvoice", err);
              else infoLog("/getTaxDataInvoice");
              res.send(data);
            });
          } catch (error) {
            errorLog("/getTaxDataInvoice", error);
            next(error);
          }
        }
      }
    );
  } catch (error) {
    errorLog("/getTaxDataInvoice", error);
    next(error);
  }
});

// Updates data of a particular invoice
InvoiceRouter.post("/updateInvoice", async (req, res, next) => {
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
        PymtAmtRecd = '${req.body.invRegisterData.PymtAmtRecd}',
        PaymentMode =  '${req.body.invRegisterData.PaymentMode}',
        PaymentReceiptDetails =  '${
          req.body.invRegisterData.PaymentReceiptDetails
        }',
        PO_No =  '${req.body.invRegisterData.PO_No}',
        Cust_Address =  '${req.body.invRegisterData.Cust_Address}',
        Cust_Place = '${req.body.invRegisterData.Cust_Place}',
        Cust_State =  '${req.body.invRegisterData.Cust_State}',
        PIN_Code = '${req.body.invRegisterData.PIN_Code}',
        Del_Address =  '${req.body.invRegisterData.Del_Address}',
        GSTNo =  '${req.body.invRegisterData.GSTNo}', 
        Net_Total = '${req.body.invRegisterData.Net_Total}', 
        TptCharges =  '${req.body.invRegisterData.TptCharges}',
        Discount =  '${req.body.invRegisterData.Discount}',
        AssessableValue =  '${req.body.invRegisterData.AssessableValue}', 
        TaxAmount =  '${req.body.invRegisterData.TaxAmount}',
        Del_Chg =  '${req.body.invRegisterData.Del_Chg}', 
        InvTotal =  '${req.body.invRegisterData.InvTotal}',
        Round_Off =  '${req.body.invRegisterData.Round_Off}',
        GrandTotal = '${req.body.invRegisterData.GrandTotal}', 
        Total_Wt = '${req.body.invRegisterData.Total_Wt}', 
        DespatchDate = '${dispatchDate}',
        TptMode = '${req.body.invRegisterData.TptMode}',
        VehNo = '${req.body.invRegisterData.VehNo}',
        Del_ContactName = '${req.body.invRegisterData.Del_ContactName || ""}',
        Del_ContactNo = '${req.body.invRegisterData.Del_ContactNo || ""}',
        Remarks = '${req.body.invRegisterData.Remarks || ""}',
        PO_Value =   '${req.body.invRegisterData.PO_Value}', 
        BillType = '${req.body.invRegisterData.BillType}',
        PaymentTerms = '${req.body.invRegisterData.PaymentTerms}'
        where DC_Inv_No = ${req.body.invRegisterData.DC_Inv_No}`,

      (err, updateRegister) => {
        if (err) {
          errorLog("/updateInvoice", err);
          console.error("errrr", err);
        } else {
          let flag = 1;

          for (let i = 0; i < req.body.invDetailsData.length; i++) {
            const element = req.body.invDetailsData[i];

            try {
              misQueryMod(
                `UPDATE magodmis.draft_dc_inv_details 
                SET 
                    Unit_Wt = '${element.Unit_Wt}',
                    DC_Srl_Wt = '${element.DC_Srl_Wt}',
                    Unit_Rate = '${element.Unit_Rate}',
                    DC_Srl_Amt = '${element.DC_Srl_Amt}',
                    Excise_CL_no = '${element.Excise_CL_no}'
                WHERE
                    (Draft_dc_inv_DetailsID = '${element.Draft_dc_inv_DetailsID}')
                        AND (DC_Inv_No = '${element.DC_Inv_No}')
                        AND (DC_Inv_Srl = '${element.DC_Inv_Srl}')`,
                (err, updateDetails) => {
                  if (err) errorLog("/updateInvoice", err);
                }
              );
            } catch (error) {
              errorLog("/updateInvoice", error);
              next(error);
            }
          }

          try {
            misQueryMod(
              `DELETE FROM magodmis.dc_inv_taxtable WHERE (Dc_inv_No = '${req.body.invRegisterData.DC_Inv_No}')`,
              (err, taxDelete) => {
                if (err) errorLog("/updateInvoice", err);
              }
            );
          } catch (error) {
            errorLog("/updateInvoice", error);
            next(error);
          }
          if (req.body.invTaxData?.length > 0) {
            for (let i = 0; i < req.body.invTaxData.length; i++) {
              const element = req.body.invTaxData[i];
              try {
                misQueryMod(
                  `INSERT INTO magodmis.dc_inv_taxtable (Dc_inv_No, DcTaxID, TaxID, Tax_Name, TaxOn, TaxableAmount, TaxPercent, TaxAmt) values('${
                    req.body.invRegisterData.DC_Inv_No
                  }', '${i + 1}', '${element.TaxID}', '${element.Tax_Name}', '${
                    element.TaxOn
                  }', '${element.TaxableAmount}', '${element.TaxPercent}', '${
                    element.TaxAmt
                  }')`,
                  (err, taxData) => {
                    if (err) errorLog("/updateInvoice", err);
                  }
                );
              } catch (error) {
                errorLog("/updateInvoice", error);
                next(error);
              }
            }
            flag = 1;
          } else {
            flag = 1;
          }
          if (flag === 1) {
            infoLog("/updateInvoice");
            res.send({
              flag: 1,
              message: "PN details saved",
            });
          } else if (flag === 0) {
            errorLog("/updateInvoice", "Error in Backend");
            res.send({
              message: "Error in Backend",
              flag: 0,
            });
          } else {
            errorLog("/updateInvoice", "Uncaught Error, Check with backend");
            res.send({
              message: "Uncaught Error, Check with backend",
              flag: 0,
            });
          }
        }
      }
    );
  } catch (error) {
    errorLog("/updateInvoice", error);
    next(error);
  }
});

// Creates new invoice data
InvoiceRouter.post("/createInvoice", async (req, res, next) => {
  const DCStatus = "Dispatched";

  try {
    misQueryMod(
      `SELECT 
          *
        FROM
          magod_setup.year_prefix_suffix
        WHERE
          UnitName = '${req.body.runningNoData.UnitName}' AND SrlType = '${req.body.runningNoData.SrlType}'`,
      (err, yearPrefixSuffixData) => {
        if (err) {
          errorLog("/createInvoice", err);
        } else {
          misQueryMod(
            `SELECT * FROM magod_setup.magod_runningno WHERE Id = '${req.body.runningNoData.Id}'`,
            (err, runningNoData) => {
              if (err) {
                errorLog("/createInvoice", err);
              } else {
                let newRunningNo = (
                  parseInt(runningNoData[0].Running_No) + 1
                ).toString();

                for (let i = 0; i < runningNoData[0].Length; i++) {
                  if (newRunningNo.length < runningNoData[0].Length) {
                    newRunningNo = 0 + newRunningNo;
                  }
                }
                let newRunningNoWithPS =
                  (yearPrefixSuffixData[0].Prefix || "") +
                  newRunningNo +
                  (yearPrefixSuffixData[0].Suffix || "");

                try {
                  misQueryMod(
                    `UPDATE magodmis.draft_dc_inv_register SET Inv_No = '${newRunningNoWithPS}',
                      DCStatus = '${DCStatus}',
                      Inv_Date = now(),
                      Inv_Fin_Year = '${runningNoData[0].Period}'
                      WHERE (DC_Inv_No = '${req.body.invRegisterData.DC_Inv_No}')`,
                    (err, updateRegister) => {
                      if (err) errorLog("/createInvoice", err);

                      try {
                        misQueryMod(
                          `UPDATE magodmis.draft_dc_inv_details SET
                              DespStatus = '${DCStatus}'
                              WHERE (DC_Inv_No = '${req.body.invRegisterData.DC_Inv_No}')`,
                          (err, updateDetails) => {
                            if (err) errorLog("/createInvoice", err);

                            try {
                              misQueryMod(
                                `SELECT 
                                    *
                                FROM
                                    magodmis.draft_dc_inv_details
                                        INNER JOIN
                                    magodmis.orderscheduledetails ON magodmis.orderscheduledetails.SchDetailsID = magodmis.draft_dc_inv_details.OrderSchDetailsID
                                WHERE
                                    magodmis.draft_dc_inv_details.DC_Inv_No = '${req.body.invRegisterData.DC_Inv_No}'`,
                                (err, deliveredAndQty) => {
                                  if (err) {
                                    errorLog("/createInvoice", err);
                                    console.error("errrr", err);
                                  } else {
                                    try {
                                      misQueryMod(
                                        `UPDATE magodmis.orderschedule SET Schedule_Status = "${DCStatus}" WHERE OrdSchNo = "${req.body.invRegisterData.OrdSchNo}"`,
                                        (err, res) => {
                                          if (err)
                                            errorLog("/createInvoice", err);
                                        }
                                      );
                                    } catch (error) {
                                      errorLog("/createInvoice", err);
                                      next(error);
                                    }

                                    for (
                                      let i = 0;
                                      i < req.body.invDetailsData?.length;
                                      i++
                                    ) {
                                      const element =
                                        req.body.invDetailsData[i];

                                      try {
                                        misQueryMod(
                                          `UPDATE magodmis.orderscheduledetails
                                            SET
                                              QtyDelivered = '${
                                                parseInt(
                                                  deliveredAndQty[i]
                                                    ?.QtyDelivered || 0
                                                ) + parseInt(element.Qty || 0)
                                              }'
                                            WHERE
                                              (SchDetailsID = '${
                                                element.OrderSchDetailsID
                                              }')`,
                                          (err, updateOrderDetails) => {
                                            if (err) {
                                              errorLog("/createInvoice", err);
                                              console.error("errrr", err);
                                            } else {
                                            }
                                          }
                                        );
                                      } catch (error) {
                                        errorLog("/createInvoice", err);
                                        next(error);
                                      }
                                    }
                                  }
                                }
                              );
                            } catch (error) {
                              errorLog("/createInvoice", error);
                              next(error);
                            }

                            try {
                              misQueryMod(
                                `UPDATE magodmis.material_issue_register SET IVStatus = '${DCStatus}' WHERE (Dc_ID = '${req.body.invRegisterData.DC_Inv_No}')`,
                                (err, InMtrlIssueRegister) => {
                                  if (err) {
                                    errorLog("/createInvoice", err);
                                  } else {
                                    misQueryMod(
                                      `UPDATE magod_setup.magod_runningno SET Running_No = '${parseInt(
                                        newRunningNo
                                      )}', Prefix = '${
                                        yearPrefixSuffixData[0].Prefix || ""
                                      }', Suffix = '${
                                        yearPrefixSuffixData[0].Suffix || ""
                                      }' WHERE (Id = '${
                                        req.body.runningNoData.Id
                                      }')`,
                                      (err, updateRunningNo) => {
                                        if (err) {
                                          errorLog("/createInvoice", err);
                                        } else {
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            } catch (error) {
                              errorLog("/createInvoice", error);
                              next(error);
                            }
                            try {
                              misQueryMod(
                                `SELECT
                                    *,
                                    DATE_FORMAT(DespatchDate, '%Y-%m-%dT%H:%i') AS DespatchDate,
                                    DATE_FORMAT(DC_Date, '%d/%m/%Y') AS DC_Date,
                                    DATE_FORMAT(DC_Date, '%d/%m/%Y') AS Printable_DC_Date,
                                    DATE_FORMAT(PO_Date, '%d/%m/%Y') AS Printable_PO_Date,
                                    DATE_FORMAT(Inv_Date, '%d/%m/%Y') AS Inv_Date,
                                    DATE_FORMAT(Inv_Date, '%d/%m/%Y') AS Printable_Inv_Date,
                                    DATE_FORMAT(DespatchDate, '%d/%m/%Y %H:%i') AS Printable_DespatchDate
                                  FROM
                                      magodmis.draft_dc_inv_register
                                      WHERE (DC_Inv_No = ${req.body.invRegisterData.DC_Inv_No})`,
                                (err, registerData) => {
                                  if (err) errorLog("/createInvoice", err);
                                  else infoLog("/createInvoice");
                                  res.send({
                                    flag: 1,
                                    message: "Invoice created",
                                    registerData: registerData,
                                  });
                                }
                              );
                            } catch (error) {
                              errorLog("/createInvoice", error);
                              next(error);
                            }
                          }
                        );
                      } catch (error) {
                        errorLog("/createInvoice", error);
                        next(error);
                      }
                    }
                  );
                } catch (error) {
                  errorLog("/createInvoice", error);
                  next(error);
                }
              }
            }
          );
        }
      }
    );
  } catch (error) {
    errorLog("/createInvoice", error);
    next(error);
  }
});

// Gets list of all Vouchers
InvoiceRouter.get("/getIVList", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT 
          *, DATE_FORMAT(IV_Date, '%d/%m/%Y') AS IV_Date
      FROM
          magodmis.material_issue_register
      WHERE
          magodmis.material_issue_register.PkngDcNo IS NULL
              AND magodmis.material_issue_register.Cust_code = '0000'
              AND magodmis.material_issue_register.IVStatus LIKE 'Draft'
      ORDER BY magodmis.material_issue_register.Iv_Id DESC`,
      (err, IVList) => {
        if (err) errorLog("/getIVList", err);
        else infoLog("/getIVList");
        res.send(IVList);
      }
    );
  } catch (error) {
    errorLog("/getIVList", error);
    next(error);
  }
});

// Gets data of a particular voucher
InvoiceRouter.post("/getIVDetails", async (req, res, next) => {
  try {
    misQueryMod(
      `SET @@sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')`,
      (err, groupBy) => {
        if (err) {
          errorLog("/getIVDetails", err);
          console.error("err", err);
        } else {
        }
      }
    );
  } catch (error) {
    errorLog("/getIVDetails", error);
    next(error);
  }
  try {
    misQueryMod(
      `SELECT * FROM magodmis.mtrl_typeslist`,
      (err, allMaterials) => {
        if (err) {
          errorLog("/getIVDetails", err);
          console.error("err", err);
        } else {
          const findExciseFromMaterial = (mtrl) => {
            for (let i = 0; i < allMaterials.length; i++) {
              const element = allMaterials[i];
              if (element.Material === mtrl) {
                return element.ExciseClNo;
              }
            }
          };
          try {
            misQueryMod(
              `SELECT 
                *,
                SUM(Qty) AS Qty,
                SUM(TotalWeightCalculated) AS TotalWeightCalculated,
                SUM(TotalWeight) AS TotalWeight
              FROM
                  magodmis.mtrlissuedetails
              WHERE
                  Iv_Id = ${req.body.Iv_Id}
              GROUP BY Material`,
              (err, ivDetails) => {
                if (err) errorLog("/getIVDetails", err);
                else infoLog("/getIVDetails");
                let detailsData = [];
                for (let i = 0; i < ivDetails.length; i++) {
                  const element = ivDetails[i];
                  detailsData = [
                    ...detailsData,
                    {
                      Dwg_No: element.Material + " Scrap",
                      Mtrl: element.Material,
                      Material: element.Material,
                      Qty: parseFloat(element.TotalWeight).toFixed(2),
                      Unit_Wt: 1,
                      Excise_CL_no:
                        findExciseFromMaterial(element.Material)?.length > 0
                          ? findExciseFromMaterial(element.Material)
                          : "",
                      DC_Srl_Wt: parseFloat(element.TotalWeight).toFixed(2),
                      Unit_Rate: 0,
                      DC_Srl_Amt: 0,
                      PkngLevel: "Pkng1",
                      InspLevel: "Insp1",
                    },
                  ];
                }
                res.send({
                  flag: 1,
                  message: "Import from IV Successfully",
                  detailsData: detailsData,
                  Iv_Id: ivDetails[0]?.Iv_Id || "",
                });
              }
            );
          } catch (error) {
            errorLog("/getIVDetails", error);
            next(error);
          }
        }
      }
    );
  } catch (error) {
    errorLog("/getIVDetails", error);
    next(error);
  }
});

module.exports = InvoiceRouter;
