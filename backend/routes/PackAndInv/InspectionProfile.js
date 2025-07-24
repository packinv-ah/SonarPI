const inspectionProfileRouter = require("express").Router();
const { misQueryMod, setupQueryMod } = require("../../helpers/dbconn");
const { errorLog, infoLog } = require("../../helpers/logger");

// Gets Schedule data of a particular customer
inspectionProfileRouter.post("/getorderschdata", async (req, res, next) => {
  let cust_code = req.body.custCode;
  let selectedOption = req.body.selectedOption;
  let selectedType = req.body.SchType;

  try {
    misQueryMod(
      `SELECT 
              *
        FROM
            magodmis.orderschedule
        WHERE
            NOT (Schedule_Status LIKE 'Created'
                OR Schedule_Status LIKE 'Dispatched'
                OR Schedule_Status LIKE 'Closed'
                OR Schedule_Status LIKE 'Cancelled'
                OR Schedule_Status LIKE 'Ready'
                OR Schedule_Status LIKE 'Suspended')
                AND ScheduleType NOT LIKE 'Combined'
                AND Type = '${selectedType}'
                AND Cust_code = '${cust_code}'
        ORDER BY ScheduleDate DESC`,
      (err, data) => {
        if (err) errorLog("/getorderschdata", err);
        else infoLog("/getorderschdata");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/getorderschdata", error);
    next(error);
  }
});

// Updates data of a particular schedule
inspectionProfileRouter.post("/updateSchDetails", async (req, res, next) => {
  for (let i = 0; i < req.body.length; i++) {
    try {
      misQueryMod(
        `UPDATE magodmis.orderscheduledetails o 
          SET o.QtyProduced='${req.body[i].QtyProduced}', o.QtyCleared='${req.body[i].QtyCleared}' 
          WHERE o.SchDetailsId='${req.body[i].SchDetailsID}'
           `,

        (err, response) => {
          if (err) errorLog("/updateSchDetails", err);
        }
      );
    } catch (error) {
      errorLog("/updateSchDetails", error);
      next(error);
    }
  }
  infoLog("/updateSchDetails");
  res.send("Set Rate Successful");
});

// Gets data of rejections
inspectionProfileRouter.post("/RejectionReport", async (req, res) => {
  try {
    misQueryMod(
      "select ir.* , r.* from magodmis.internal_rejectionpartslist AS ir INNER JOIN magodmis.rejectionslist AS r ON ir.Rej_Id = r.Id ORDER BY ir.Id DESC LIMIT 1",
      (err, data) => {
        if (err) errorLog("/RejectionReport", err);
        else infoLog("/RejectionReport");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/RejectionReport", error);
  }
});

// Posts a rejection report
inspectionProfileRouter.post("/submitRejectionReport", async (req, res) => {
  try {
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, "0");
    const day = String(today.getUTCDate()).padStart(2, "0");
    let Rej_ReportDate = `${year}-${month}-${day}`;

    const { dcInvNo, unit, srlType, prefix } = req.body;

    const date = new Date();

    const getYear =
      date.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    const yearParts = getYear.split("-");
    const startYearShort = yearParts[0].slice(-2);
    const endYearShort = yearParts[1].slice(-2);
    const finYear = `${startYearShort}/${endYearShort}`;

    try {
      const selectQuery = `
      SELECT * FROM magod_setup.magod_runningno WHERE SrlType='${srlType}' AND UnitName='${unit}' ORDER BY Id DESC LIMIT 1;
      `;

      setupQueryMod(selectQuery, async (selectError, selectResult) => {
        if (selectError) {
          errorLog("/submitRejectionReport", selectError);
          return next(selectResult);
        }

        let newDCNo = "";

        if (selectResult && selectResult.length > 0) {
          const lastRunNo = selectResult[0].Running_No;
          const numericPart = parseInt(lastRunNo) + 1;

          const paddedNumericPart = numericPart.toString().padStart(4, "0");

          newDCNo = `${finYear} / ${prefix}${paddedNumericPart}`;

          const updateRunningNoQuery = `
            UPDATE magod_setup.magod_runningno
            SET Running_No = ${numericPart}
            WHERE SrlType='${srlType}' AND UnitName='${unit}' AND Period='${finYear}';
          `;

          setupQueryMod(updateRunningNoQuery, (updateError, updateResult) => {
            if (updateError) {
              errorLog("/submitRejectionReport", updateError);
              return next(updateResult);
            }
          });
        }
        try {
          const formattedDate = new Date(Rej_ReportDate)
            .toISOString()
            .split("T")[0];

          const query = `
            INSERT INTO magodmis.rejectionslist(
              Rej_ReportNo, RaisedBy, Internal, Rej_ReportDate, RejctionValue, AcceptedValue, OrderScheduleNo, Cust_Code, Cust_Name, ScheduleId, Rej_Status
            ) VALUES (
              '${newDCNo}',
              '${req.body.RaisedBy}',
              '1',
              '${formattedDate}',  
              ${parseFloat(
                req.body.rejectedValue
              )},  -- Parse as float for decimal values
              ${parseFloat(req.body.acceptedValue)},
              '${req.body.Rejection_Ref}',
              '${req.body.Cust_Code}',
              '${req.body.Cust_Name}',
              ${parseInt(
                req.body.ScheduleId,
                10
              )},  -- Parse as integer for ScheduleId
              '${req.body.Status}'
            )`;

          misQueryMod(query, (err, rejData) => {
            if (err) {
              errorLog("/submitRejectionReport", err);
              console.error("Error:", err);
            } else {
              const rejId = rejData.insertId;

              for (
                let i = 0;
                i < req.body.selectedScheduleDetailsRows.length;
                i++
              ) {
                const element = req.body.selectedScheduleDetailsRows[i];

                const query1 = `
                    INSERT INTO magodmis.internal_rejectionpartslist (
                      Rej_Id, Dwg_Name, Qty_Rejected, Rejection_Reason, SchDetailsID
                    ) VALUES (
                   ${parseInt(rejId)},
                  '${element.DwgName}',
                  ${parseInt(req.body.QtyRejected[i])},
                  '${req.body.RejectedReason[i]}',
                  ${parseInt(element.SchDetailsID)}
    
                )`;

                misQueryMod(query1, (err, intRejData) => {
                  if (err) {
                    errorLog("/submitRejectionReport", err);
                    console.error("Error:", err);
                  } else {
                    misQueryMod(
                      `UPDATE magodmis.orderscheduledetails SET QtyRejected = QtyRejected + ${parseInt(
                        req.body.QtyRejected[i]
                      )} WHERE SchDetailsID = ${parseInt(
                        element.SchDetailsID
                      )}`,
                      (uerr, updateQtyResult) => {
                        if (uerr) {
                          errorLog("/submitRejectionReport", uerr);
                          console.error("Error:", uerr);
                        } else {
                          infoLog("/submitRejectionReport");
                          res.send(updateQtyResult);
                        }
                      }
                    );
                  }
                });
              }
            }
          });
        } catch (error) {
          errorLog("/submitRejectionReport", error);
          next(error);
        }
      });
    } catch (error) {
      errorLog("/submitRejectionReport", error);
      console.error("An error occurred:", error);
      next(error);
    }
  } catch (error) {
    console.error("Error in submitRejectionReport:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Deletes a particular draft packing note
inspectionProfileRouter.post("/deleteDraftPN", (req, res) => {
  try {
    misQueryMod(
      `DELETE FROM magodmis.draft_dc_inv_register WHERE (DC_Inv_No = '${req.body.DC_Inv_No}')`,
      (err, deleteData) => {
        if (err) {
          errorLog("/deleteDraftPN", err);
          console.error("errrr", err);
        } else {
          infoLog("/deleteDraftPN");
          res.send({
            flag: 1,
            message: "Delete draft PN successful",
          });
        }
      }
    );
  } catch (error) {
    errorLog("/deleteDraftPN", error);
    next(error);
  }
});

// Posts details of a Draft packing note
inspectionProfileRouter.post("/postCreateDraftPN", async (req, res, next) => {
  let totalWeight = 0;
  let netTotal = 0;

  for (let i = 0; i < req.body.rowsForCreateDraftPN.length; i++) {
    const element = req.body.rowsForCreateDraftPN[i];

    let qtyForDraft =
      parseInt(element.QtyCleared) -
      parseInt(element.QtyPacked) -
      parseInt(element.InDraftPN);
    totalWeight =
      parseFloat(totalWeight) +
      parseInt(qtyForDraft || 0) * parseFloat(element.UnitWt || 0);
  }

  for (let i = 0; i < req.body.rowsForCreateDraftPN.length; i++) {
    const element = req.body.rowsForCreateDraftPN[i];
    let qty =
      parseInt(element.QtyCleared) -
      parseInt(element.QtyPacked) -
      parseInt(element.InDraftPN);

    netTotal =
      netTotal +
      parseFloat(qty) *
        (parseFloat(element.JWCost || 0) + parseFloat(element.MtrlCost || 0));
  }

  const DCStatus = "Draft";
  try {
    misQueryMod(
      `INSERT INTO magodmis.draft_dc_inv_register
        (ScheduleId, Dc_inv_Date, DC_InvType, InvoiceFor, OrderNo, OrderScheduleNo, OrderDate, DC_Date, Cust_Code, Cust_Name, Cust_Address, Cust_Place, Cust_State, Cust_StateId, PIN_Code, Del_Address, GSTNo, PO_No, Net_Total, Total_Wt, DCStatus, InspBy, PackedBy, PaymentTerms,BillType,PAN_No)
        VALUES
        ('${req.body.headerData.ScheduleId}', now(),'${
        req.body.headerData.ScheduleType
      }', '${req.body.headerData.Type}', '${req.body.headerData.Order_No}', '${
        req.body.headerData.OrdSchNo
      }', '${req.body.headerData.OriginalScheduleDate.split("T")[0]}', now(),'${
        req.body.headerData.Cust_Code
      }', '${req.body.headerData.Cust_name}', '${
        req.body.headerData.Address || ""
      }', '${req.body.headerData.City || ""}', '${
        req.body.headerData.State || ""
      }', '${req.body.headerData.StateId}', '${
        req.body.headerData.Pin_Code || ""
      }', 'Ex Factory', '${req.body.headerData.GSTNo || ""}', '${
        req.body.headerData.PO || ""
      }', '${parseFloat(netTotal || 0).toFixed(2)}', '${parseFloat(
        totalWeight || 0
      ).toFixed(3)}', '${DCStatus}','${
        req.body.headerData.SalesContact || ""
      }','${req.body.headerData.Inspected_By || ""}','${
        req.body.headerData.PaymentTerms || ""
      }','${req.body.headerData.BillType || ""}','${
        req.body.headerData.PAN_No || ""
      }')`,
      (err, registerData) => {
        if (err) {
          errorLog("/postCreateDraftPN", err);
          console.error("errrr", err);
        } else {
          try {
            misQueryMod(
              `SELECT 
                    *
                FROM
                    magodmis.mtrl_typeslist
                        INNER JOIN
                    magodmis.mtrl_data ON magodmis.mtrl_typeslist.Material LIKE magodmis.mtrl_data.Mtrl_Type`,
              (err, materialsData) => {
                if (err) {
                  errorLog("/postCreateDraftPN", err);
                  console.error("errr", err);
                } else {
                  let flag = [];
                  for (
                    let i = 0;
                    i < req.body.rowsForCreateDraftPN.length;
                    i++
                  ) {
                    const element = req.body.rowsForCreateDraftPN[i];

                    let filteredMaterialData =
                      materialsData.filter(
                        (obj) =>
                          obj.Mtrl_Code === element.Mtrl_Code ||
                          obj.MtrlGradeID === element.Mtrl ||
                          obj.Material === element.Material
                      )[0] || {};

                    let qtyForDraft =
                      parseInt(element.QtyCleared) -
                      parseInt(element.QtyPacked) -
                      parseInt(element.InDraftPN);

                    try {
                      misQueryMod(
                        `INSERT INTO magodmis.draft_dc_inv_details
                          (DC_Inv_No, DC_Inv_Srl, ScheduleID, OrderSchDetailsID, Cust_Code, Order_No, Order_Srl_No, OrderScheduleNo,Dwg_Code, Dwg_No, Mtrl, Material, Qty, Unit_Wt, DC_Srl_Wt, Unit_Rate, DC_Srl_Amt, Excise_CL_no, DespStatus, PkngLevel, InspLevel, Mtrl_rate, JW_Rate)
                          VALUES
                          (
                       ${registerData.insertId}, ${i + 1},  ${
                          element.ScheduleId
                        }, ${element.SchDetailsID}, '${
                          req.body.headerData.Cust_Code
                        }', '${req.body.headerData.Order_No}', '${
                          element.Schedule_Srl
                        }', '${req.body.headerData.OrdSchNo}','${
                          element.Dwg_Code
                        }', '${element.DwgName}', '${element.Mtrl_Code}', '${
                          filteredMaterialData.Material || ""
                        }', '${qtyForDraft || 0}', ${parseFloat(
                          element.UnitWt || 0
                        ).toFixed(3)}, ${(
                          parseFloat(qtyForDraft || 0) *
                          parseFloat(element.UnitWt || 0)
                        ).toFixed(3)}, ${parseFloat(
                          element.UnitPrice || 0
                        ).toFixed(2)}, ${(
                          parseFloat(qtyForDraft || 0) *
                          parseFloat(element.UnitPrice || 0)
                        ).toFixed(2)}, '${
                          filteredMaterialData.ExciseClNo || ""
                        }', '${DCStatus}', '${
                          element.PackingLevel || "Pkng1"
                        }', '${element.InspLevel || "Insp1"}',
                           ${parseFloat(element.MtrlCost || 0).toFixed(
                             2
                           )},${parseFloat(element.JWCost || 0).toFixed(2)})`,

                        (err, detailsData) => {
                          if (err) {
                            errorLog("/postCreateDraftPN", err);
                            console.error("errr", err);
                          } else {
                            flag.push(1);
                          }
                        }
                      );
                    } catch (error) {
                      errorLog("/postCreateDraftPN", error);
                      next(error);
                    }
                  }
                  if (flag.length > 0) {
                    errorLog("/postCreateDraftPN", "Backend Error");
                    res.send({ flag: 0, message: "Some backend error occur" });
                  } else {
                    infoLog("/postCreateDraftPN");
                    res.send({
                      flag: 1,
                      message: "Create draft PN successfull",
                    });
                  }
                }
              }
            );
          } catch (error) {
            errorLog("/postCreateDraftPN", error);
            next(error);
          }
        }
      }
    );
  } catch (error) {
    errorLog("/postCreateDraftPN", error);
    next(error);
  }
});

// Saves data of a draft packing note
inspectionProfileRouter.post("/saveDraftPN", async (req, res, next) => {
  let netTotal = 0;

  for (let i = 0; i < req.body.invDetailsData.length; i++) {
    const element = req.body.invDetailsData[i];

    netTotal =
      netTotal +
      parseFloat(element.Qty || 0) *
        (parseFloat(element.JW_Rate || 0) + parseFloat(element.Mtrl_rate || 0));

    try {
      misQueryMod(
        `UPDATE magodmis.draft_dc_inv_details 
        SET 
            Qty = '${parseInt(element.Qty)}',
            DC_Srl_Amt = '${(
              parseFloat(element.Qty) * parseFloat(element.Unit_Rate)
            ).toFixed(2)}',
            Unit_Wt = '${parseFloat(element.Unit_Wt).toFixed(3)}',
            DC_Srl_Wt = '${(
              parseFloat(element.Qty) * parseFloat(element.Unit_Wt)
            ).toFixed(3)}'
        WHERE
            (Draft_dc_inv_DetailsID = '${element.Draft_dc_inv_DetailsID}')
                AND (DC_Inv_No = '${element.DC_Inv_No}')
                AND (DC_Inv_Srl = '${element.DC_Inv_Srl}')`,
        (err, updateDetails) => {
          if (err) {
            errorLog("/saveDraftPN", err);
            console.error("errrr", err);
          } else {
          }
        }
      );
    } catch (error) {
      errorLog("/saveDraftPN", error);
      next(error);
    }
  }

  try {
    misQueryMod(
      `UPDATE magodmis.draft_dc_inv_register SET Net_Total = '${parseFloat(
        netTotal || 0
      )}' WHERE (DC_Inv_No = '${req.body.invDetailsData[0].DC_Inv_No}')`,
      (err, updateRegister) => {
        if (err) {
          errorLog("/saveDraftPN", err);
          console.error("errrr", err);
        } else {
          res.send({
            flag: 1,
            message: "Update draft PN successful",
          });
        }
      }
    );
  } catch (error) {
    errorLog("/saveDraftPN", error);
    next(error);
  }
});

// Creates a new packing note
inspectionProfileRouter.post("/preparePN", async (req, res, next) => {
  const DCStatus = "Packed";
  const today = new Date();

  var todayDate = today.toISOString().split("T")[0];

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
          errorLog("/preparePN", err);
        } else {
          misQueryMod(
            `SELECT * FROM magod_setup.magod_runningno WHERE Id = '${req.body.runningNoData.Id}'`,
            (err, runningNoData) => {
              if (err) {
                errorLog("/preparePN", err);
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
                    `UPDATE magodmis.draft_dc_inv_register
                SET
                    DC_No = '${newRunningNoWithPS}',
                    DC_Date = '${todayDate}',
                    DC_Fin_Year = '${runningNoData[0].Period}',
                    DCStatus = '${DCStatus}',
                    InspBy = '${req.body.insAndPack.inspectedBy}',
                    PackedBy = '${req.body.insAndPack.packedBy}'
                WHERE
                    (DC_Inv_No = '${req.body.DC_Inv_No}')`,
                    (err, updateRegister) => {
                      if (err) {
                        errorLog("/preparePN", err);
                      } else {
                        try {
                          misQueryMod(
                            `UPDATE magodmis.draft_dc_inv_details
                      SET
                          DespStatus = '${DCStatus}'
                      WHERE
                          (DC_Inv_No = '${req.body.DC_Inv_No}')`,
                            (err, updateDetails) => {
                              if (err) {
                                errorLog("/preparePN", err);
                              } else {
                                try {
                                  misQueryMod(
                                    `SELECT 
                                        *
                                    FROM
                                        magodmis.draft_dc_inv_details
                                            INNER JOIN
                                        magodmis.orderscheduledetails ON magodmis.orderscheduledetails.SchDetailsID = magodmis.draft_dc_inv_details.OrderSchDetailsID
                                    WHERE
                                        magodmis.draft_dc_inv_details.DC_Inv_No = '${req.body.DC_Inv_No}'`,
                                    (err, packedAndQty) => {
                                      if (err) {
                                        errorLog("/preparePN", err);
                                        console.error("errrr", err);
                                      } else {
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
                                                    QtyPacked = '${
                                                      parseInt(
                                                        packedAndQty[i]
                                                          .QtyPacked || 0
                                                      ) +
                                                      parseInt(element.Qty || 0)
                                                    }'
                                                WHERE
                                                  (SchDetailsID = '${
                                                    element.OrderSchDetailsID
                                                  }')`,
                                              (err, updateOrderDetails) => {
                                                if (err) {
                                                  errorLog("/preparePN", err);
                                                  console.error("errrr", err);
                                                } else {
                                                  misQueryMod(
                                                    `UPDATE magod_setup.magod_runningno SET Running_No = '${parseInt(
                                                      newRunningNo
                                                    )}', Prefix = '${
                                                      yearPrefixSuffixData[0]
                                                        .Prefix || ""
                                                    }', Suffix = '${
                                                      yearPrefixSuffixData[0]
                                                        .Suffix || ""
                                                    }' WHERE (Id = '${
                                                      req.body.runningNoData.Id
                                                    }')`,
                                                    (err, updateRunningNo) => {
                                                      if (err) {
                                                        errorLog(
                                                          "/preparePN",
                                                          err
                                                        );
                                                      } else {
                                                        console.error(
                                                          "updated running no"
                                                        );
                                                      }
                                                    }
                                                  );
                                                }
                                              }
                                            );
                                          } catch (error) {
                                            errorLog("/preparePN", error);
                                            next(error);
                                          }
                                        }

                                        res.send({
                                          flag: 1,
                                          message: "Prepare PN successful",
                                        });
                                      }
                                    }
                                  );
                                } catch (error) {
                                  errorLog("/preparePN", error);
                                  next(error);
                                }
                              }
                            }
                          );
                        } catch (error) {
                          errorLog("/preparePN", error);
                          next(error);
                        }
                      }
                    }
                  );
                } catch (error) {
                  errorLog("/preparePN", error);
                  next(error);
                }
              }
            }
          );
        }
      }
    );
  } catch (error) {
    errorLog("/preparePN", error);
    next(error);
  }
});

// Gets data of a particular schedule
inspectionProfileRouter.post(
  "/getOrderScheduleData",
  async (req, res, next) => {
    try {
      misQueryMod(
        `UPDATE magodmis.task_partslist t, magodmis.orderscheduledetails o
         SET o.QtyProduced = t.QtyCleared
         WHERE o.ScheduleId = ${req.body.scheduleID}
         AND o.SchDetailsId = t.SchDetailsId;`,
        (err, updateResult) => {
          if (err) {
            errorLog("/getOrderScheduleData", err);
            next(err);
          } else {
            try {
              misQueryMod(
                `SELECT
                    *,
                    ScheduleDate AS OriginalScheduleDate,
                    DATE_FORMAT(schTgtDate, '%d/%m/%Y') AS schTgtDate,
                    DATE_FORMAT(ScheduleDate, '%d/%m/%Y') AS ScheduleDate,
                    DATE_FORMAT(Delivery_Date, '%d/%m/%Y') AS Delivery_Date
                 FROM
                    magodmis.orderschedule
                    INNER JOIN
                    magodmis.cust_data ON magodmis.orderschedule.Cust_Code = magodmis.cust_data.Cust_Code
                 WHERE
                    magodmis.orderschedule.ScheduleId = ${req.body.scheduleID}`,
                (err, headerData) => {
                  if (err) {
                    errorLog("/getOrderScheduleData", err);
                    next(err);
                  } else {
                    let InDraftPN = 0;
                    try {
                      misQueryMod(
                        `SELECT * FROM magodmis.orderscheduledetails WHERE magodmis.orderscheduledetails.ScheduleId = ${req.body.scheduleID}`,
                        (err, orderScheduleDetailsData) => {
                          if (err) {
                            errorLog("/getOrderScheduleData", err);
                            next(err);
                          } else {
                            try {
                              misQueryMod(
                                `SET @@sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')`,
                                (err, updateGroupBy) => {
                                  if (err) {
                                    errorLog("/getOrderScheduleData", err);
                                    next(err);
                                  } else {
                                    try {
                                      misQueryMod(
                                        `SELECT
                                            *,
                                            SUM(qty) AS Qty
                                         FROM
                                            magodmis.draft_dc_inv_details
                                         WHERE
                                            ScheduleId = ${req.body.scheduleID}
                                            AND DespStatus != 'Cancelled'
                                         GROUP BY OrderSchDetailsID, DespStatus`,
                                        (err, draftDCInvDetailsData) => {
                                          if (err) {
                                            errorLog(
                                              "/getOrderScheduleData",
                                              err
                                            );
                                            next(err);
                                          } else {
                                            for (
                                              let i = 0;
                                              i <
                                              orderScheduleDetailsData.length;
                                              i++
                                            ) {
                                              orderScheduleDetailsData[
                                                i
                                              ].InDraftPN = 0;
                                            }

                                            for (
                                              let i = 0;
                                              i <
                                              orderScheduleDetailsData.length;
                                              i++
                                            ) {
                                              const element0 =
                                                orderScheduleDetailsData[i];
                                              for (
                                                let j = 0;
                                                j <
                                                draftDCInvDetailsData.length;
                                                j++
                                              ) {
                                                const element1 =
                                                  draftDCInvDetailsData[j];
                                                if (
                                                  element0.SchDetailsID ===
                                                    element1.OrderSchDetailsID &&
                                                  element1.DespStatus ===
                                                    "Draft"
                                                ) {
                                                  orderScheduleDetailsData[
                                                    i
                                                  ].InDraftPN = element1.Qty;
                                                }
                                              }
                                            }

                                            try {
                                              misQueryMod(
                                                `SELECT
                                                    *,
                                                    DATE_ADD(DespatchDate, INTERVAL 1 DAY) AS DespatchDate,
                                                    DATE_FORMAT(Dc_inv_Date, '%d/%m/%Y %T') AS Printable_Dc_inv_Date,
                                                    DATE_FORMAT(DC_Date, '%d/%m/%Y') AS Printable_DC_Date,
                                                    DATE_FORMAT(PO_Date, '%d/%m/%Y') AS Printable_PO_Date,
                                                    DATE_FORMAT(Inv_Date, '%d/%m/%Y') AS Printable_Inv_Date,
                                                    DATE_FORMAT(DespatchDate, '%d/%m/%Y') AS Printable_DespatchDate
                                                 FROM
                                                    magodmis.draft_dc_inv_register
                                                 WHERE
                                                    ScheduleId = ${req.body.scheduleID}`,
                                                (err, invRegisterData) => {
                                                  if (err) {
                                                    errorLog(
                                                      "/getOrderScheduleData",
                                                      err
                                                    );
                                                    next(err);
                                                  } else {
                                                    try {
                                                      misQueryMod(
                                                        `SELECT * FROM magodmis.draft_dc_inv_details WHERE ScheduleId = ${req.body.scheduleID}`,
                                                        (
                                                          err,
                                                          invDetailsData
                                                        ) => {
                                                          if (err) {
                                                            errorLog(
                                                              "/getOrderScheduleData",
                                                              err
                                                            );
                                                            next(err);
                                                          } else {
                                                            res.send({
                                                              headerData:
                                                                headerData[0],
                                                              orderScheduleDetailsData:
                                                                orderScheduleDetailsData,
                                                              allInvDetailsData:
                                                                invDetailsData,
                                                              invRegisterData:
                                                                invRegisterData,
                                                            });
                                                          }
                                                        }
                                                      );
                                                    } catch (error) {
                                                      errorLog(
                                                        "/getOrderScheduleData",
                                                        error
                                                      );
                                                      next(error);
                                                    }
                                                  }
                                                }
                                              );
                                            } catch (error) {
                                              errorLog(
                                                "/getOrderScheduleData",
                                                error
                                              );
                                              next(error);
                                            }
                                          }
                                        }
                                      );
                                    } catch (error) {
                                      errorLog("/getOrderScheduleData", error);
                                      next(error);
                                    }
                                  }
                                }
                              );
                            } catch (error) {
                              errorLog("/getOrderScheduleData", error);
                              next(error);
                            }
                          }
                        }
                      );
                    } catch (error) {
                      errorLog("/getOrderScheduleData", error);
                      next(error);
                    }
                  }
                }
              );
            } catch (error) {
              errorLog("/getOrderScheduleData", error);
              next(error);
            }
          }
        }
      );
    } catch (error) {
      errorLog("/getOrderScheduleData", error);
      next(error);
    }
  }
);

// Gets data of a particular rejected schedule
inspectionProfileRouter.post("/testRejectData", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT * FROM magodmis.rejectionslist r WHERE r.ScheduleId=${req.body.scId} `,
      (err, data) => {
        if (err) errorLog("/testRejectData", err);

        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/testRejectData", error);
  }
});

// Gets data of a particular internally rejected schedule
inspectionProfileRouter.post(
  "/testInternalRejectData",
  async (req, res, next) => {
    try {
      misQueryMod(
        `
          SELECT i.* FROM  magodmis.internal_rejectionpartslist i
          WHERE  i.Rej_Id=${req.body.row.Id}`,
        async (error, data) => {
          if (error) {
            errorLog("/testInternalRejectData", error);
            console.error("Error executing query:", error);
          } else {
            res.send(data);
          }
        }
      );
    } catch (error) {
      errorLog("/testInternalRejectData", error);
      next(error);
    }
  }
);

// Gets Schedule Data for Search
inspectionProfileRouter.post(
  "/getOrderDataforFindSchedule",
  async (req, res) => {
    try {
      misQueryMod(
        `SELECT o.*
        FROM magodmis.orderschedule o
        WHERE NOT (
            o.Schedule_Status LIKE 'Created'
            OR o.Schedule_Status LIKE 'Dispatched'
            OR o.Schedule_Status LIKE 'Closed'
            OR o.Schedule_Status LIKE 'Cancelled'
            OR o.Schedule_Status LIKE 'Ready'
            OR o.Schedule_Status LIKE 'Suspended'
            OR o.Schedule_Status LIKE 'Comb%'
        )
        AND o.ScheduleType NOT LIKE 'Combined'
        
        ORDER BY o.ScheduleDate DESC `,
        (err, data) => {
          if (err) errorLog("/getOrderDataforFindSchedule", err);
          res.send(data);
        }
      );
    } catch (error) {
      errorLog("/getOrderDataforFindSchedule", error);
    }
  }
);

// Posts new running no. data
inspectionProfileRouter.post("/insertRunNoRow", async (req, res, next) => {
  const { unit, srlType, ResetPeriod, ResetValue, VoucherNoLength, prefix } =
    req.body;

  const unitName = `${unit}`;
  const date = new Date();

  const year = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? year : year - 1;
  const endYear = startYear + 1;

  const firstLetter = unitName.charAt(0).toUpperCase();
  const financialYearStartDate = new Date(`${startYear}-04-01`);
  const financialYearEndDate = new Date(`${endYear}-04-01`);

  const formattedStartDate = financialYearStartDate.toISOString().slice(0, 10);
  const formattedEndDate = financialYearEndDate.toISOString().slice(0, 10);

  const getYear =
    date.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  const yearParts = getYear.split("-");
  const startYearShort = yearParts[0].slice(-2);
  const endYearShort = yearParts[1].slice(-2);
  const finYear = `${startYearShort}/${endYearShort}`;

  try {
    const selectQuery = `
    SELECT COUNT(Id) FROM magod_setup.magod_runningno  WHERE SrlType='${srlType}'
    AND UnitName='${unit}' AND Period='${finYear}'
    `;

    setupQueryMod(selectQuery, (selectError, selectResult) => {
      if (selectError) {
        errorLog("/insertRunNoRow", selectError);
        return next(selectResult);
      }

      const count = selectResult[0]["COUNT(Id)"];

      if (count === 0) {
        const insertQuery = `
          INSERT INTO magod_setup.magod_runningno
          (UnitName, SrlType, ResetPeriod, ResetValue, EffectiveFrom_date, Reset_date, Running_No, Prefix, Length, Period, Running_EffectiveDate)
          VALUES ('${unit}', '${srlType}', '${ResetPeriod}', ${ResetValue}, '${formattedStartDate}', '${formattedEndDate}',${ResetValue}, '${prefix}', ${VoucherNoLength}, '${finYear}', CurDate());
        `;

        setupQueryMod(insertQuery, (insertError, insertResult) => {
          if (insertError) {
            errorLog("/insertRunNoRow", insertError);
            return next(insertResult);
          }

          res.json({ message: "Record inserted successfully." });
        });
      } else {
        res.json({ message: "Record already exists." });
      }
    });
  } catch (error) {
    errorLog("/insertRunNoRow", error);
    console.error("An error occurred:", error);
    next(error);
  }
});

module.exports = inspectionProfileRouter;
