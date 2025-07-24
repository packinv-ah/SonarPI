const pnrdcRouter = require("express").Router();
const { misQueryMod, setupQueryMod } = require("../../helpers/dbconn");
const { errorLog, infoLog } = require("../../helpers/logger");

// Gets data of a particular customer
pnrdcRouter.post("/getCustomerDetails", async (req, res, next) => {
  const cust_code = req.body.custCode;

  try {
    misQueryMod(
      `select * from magodmis.cust_data WHERE Cust_Code = ${cust_code}`,
      (err, data) => {
        if (err) errorLog("/getCustomerDetails", err);
        else infoLog("/getCustomerDetails");
        res.send(data[0]);
      }
    );
  } catch (error) {
    errorLog("/getCustomerDetails", error);
    next(error);
  }
});

// Creates new customer data
pnrdcRouter.post("/postCustDetails", async (req, res, next) => {
  const { Cust_Code, Cust_Address, dcStatus } = req.body;

  try {
    misQueryMod(
      `INSERT INTO magodmis.draft_dc_inv_register (IsDC, DC_InvType, Cust_Code, Cust_Name, Cust_Address, Cust_Place, Cust_State, Cust_StateId, DCStatus, PIN_Code, GSTNo, Del_Address, BillType)
      SELECT TRUE, 'ReturnableDC', c.Cust_Code, c.Cust_name, '${Cust_Address}', c.City, c.State, c.StateId, '${dcStatus}', c.Pin_Code, c.GSTNo, 'Consignee Address', 'DC'
      FROM magodmis.cust_data c
      WHERE c.Cust_Code = ${Cust_Code}`,
      async (err, data) => {
        if (err) {
          errorLog("/postCustDetails", err);
          return next(err);
        }

        try {
          const selectQuery = `SELECT LAST_INSERT_ID() AS DcId`;
          misQueryMod(selectQuery, (err, data) => {
            if (err) {
              errorLog("/postCustDetails", err);
              return next(err);
            }
            const lastInsertedId = data[0].DcId;
            infoLog("/postCustDetails");
            res.send({ DcId: lastInsertedId });
          });
        } catch (error) {
          errorLog("/postCustDetails", error);
          next(error);
        }
      }
    );
  } catch (error) {
    errorLog("/postCustDetails", error);
    next(error);
  }
});

// Gets tax data of a particular customer type
pnrdcRouter.post("/loadTaxes", async (req, res, next) => {
  const { stateId, unitStateId, isGovOrg, isForiegn, gstNo, UnitGSTNo } =
    req.body;

  try {
    let insertQuery = "";

    if (isGovOrg === 1) {
      insertQuery = `SELECT t.TaxID AS DCTaxId, 1 AS TaxId, t.TaxName, t.TaxOn, 0 AS TaxableAmount, t.Tax_Percent, 0 AS TaxAmount
      FROM magod_setup.taxdb t WHERE TaxId IS NULL AND DATE(t.EffectiveTO) > CURRENT_DATE();`;
    } else if (isForiegn === 1) {
      insertQuery = `SELECT t.TaxID AS DCTaxId, 1 AS TaxId, t.TaxName, t.TaxOn, 0 AS TaxableAmount, t.Tax_Percent, 0 AS TaxAmount
      FROM magod_setup.taxdb t WHERE IGST !=0 AND t.UNDERGROUP != 'INCOMETAX' AND DATE(t.EffectiveTO) > CURRENT_DATE();`;
    } else if (gstNo === null) {
      insertQuery = `SELECT t.TaxID AS DCTaxId, 1 AS TaxId, t.TaxName, t.TaxOn, 0 AS TaxableAmount, t.Tax_Percent, 0 AS TaxAmount
      FROM magod_setup.taxdb t WHERE t.IGST = 0 AND t.UnderGroup !=  'INCOMETAX' AND DATE(t.EffectiveTO) > CURRENT_DATE();
      ;
      `;
    } else if (stateId !== unitStateId) {
      insertQuery = `
        SELECT t.TaxID AS DCTaxId, 1 AS TaxId, t.TaxName, t.TaxOn, 0 AS TaxableAmount, t.Tax_Percent, 0 AS TaxAmount
        FROM magod_setup.taxdb t WHERE t.IGST != 0 AND t.UnderGroup != 'INCOMETAX' AND DATE(t.EffectiveTO) > CURRENT_DATE();
      `;
    } else if (gstNo === UnitGSTNo) {
      insertQuery = `
        SELECT t.TaxID AS DCTaxId, 1 AS TaxId, t.TaxName, t.TaxOn, 0 AS TaxableAmount, t.Tax_Percent, 0 AS TaxAmount
        FROM magod_setup.taxdb t WHERE TaxId IS NULL AND DATE(t.EffectiveTO) > CURRENT_DATE();
      `;
    } else {
      insertQuery = `
        SELECT t.TaxID AS DCTaxId, 1 AS TaxId, t.TaxName, t.TaxOn, 0 AS TaxableAmount, t.Tax_Percent, 0 AS TaxAmount
        FROM magod_setup.taxdb t WHERE t.IGST = 0 AND t.UnderGroup != 'INCOMETAX' AND DATE(t.EffectiveTO) > CURRENT_DATE();
      `;
    }

    misQueryMod(insertQuery, (err, insertResult) => {
      if (err) {
        errorLog("/loadTaxes", err);
        return next(err);
      }
      infoLog("/loadTaxes");
      res.send(insertResult);
    });
  } catch (error) {
    errorLog("/loadTaxes", error);
    next(error);
  }
});

// Updates Selected Tax data
pnrdcRouter.post("/taxSelection", (req, res, next) => {
  const { dcInvNo, selectedTax } = req.body;
  let selectResult;

  misQueryMod(
    `DELETE FROM magodmis.dc_inv_taxtable WHERE Dc_Inv_No = ${dcInvNo}`,
    (deleteErr, deleteData) => {
      if (deleteErr) {
        errorLog("/taxSelection", deleteErr);
        return next(deleteErr);
      }

      selectedTax.forEach((tax, index, array) => {
        const insertTaxQuery = `
        INSERT INTO magodmis.dc_inv_taxtable (Dc_inv_No, DCTaxId, TaxId, Tax_Name, TaxOn, TaxableAmount, TaxPercent, TaxAmt)
        VALUES (
          ${dcInvNo},
          ${tax.DCTaxId},
          ${tax.TaxId},
          '${tax.TaxName}',
          '${tax.TaxOn}',
          ${tax.TaxableAmount},
          '${tax.Tax_Percent}',
          '${tax.TaxAmount}'
        )
      `;

        misQueryMod(insertTaxQuery, (insertErr, insertData) => {
          if (insertErr) {
            errorLog("/taxSelection", insertErr);
            return next(insertErr);
          }

          if (index === array.length - 1) {
            const selectQuery = `SELECT * FROM magodmis.dc_inv_taxtable WHERE Dc_Inv_No = ${dcInvNo}`;
            misQueryMod(selectQuery, (selectErr, selectData) => {
              if (selectErr) {
                errorLog("/taxSelection", selectErr);
                return next(selectErr);
              }
              infoLog("/taxSelection");

              res.send(selectData);
            });
          }
        });
      });
    }
  );
});

// Updates data of a particular customer
pnrdcRouter.post("/updateCust", async (req, res, next) => {
  const {
    Cust_Code,
    Cust_Name,
    custState,
    custStateId,
    deliveryState,
    refernce,
    custAddress,
    custCity,
    custPin,
    deliveryAddress,
    gstNo,
    dcInvNo,
  } = req.body;

  try {
    setupQueryMod(
      `SELECT StateCode FROM magod_setup.state_codelist WHERE State="${deliveryState}"`,
      async (selectErr, selectData) => {
        if (selectErr) {
          errorLog("/updateCust", selectErr);
          return next(selectErr);
        }

        const stateCode = selectData[0]?.StateCode || "";

        misQueryMod(
          `UPDATE magodmis.draft_dc_inv_register
           SET
           Cust_Code = '${Cust_Code}',
           Cust_Name = '${Cust_Name}',
           Cust_Address = '${custAddress}',
           Cust_State = '${custState}',
           Cust_StateId = '${custStateId}',
           Cust_Place = '${custCity}',
           PIN_Code = '${custPin}',
           Del_Address = '${deliveryAddress}',
           PO_No = '${refernce}',
           GSTNo = '${gstNo}',
           Del_StateId = '${stateCode}'
           WHERE DC_Inv_No = ${dcInvNo}`,
          async (updateErr, updateData) => {
            if (updateErr) {
              errorLog("/updateCust", updateErr);
              return next(updateErr);
            }
            infoLog("/updateCust");

            res.send({ status: "Updated" });
          }
        );
      }
    );
  } catch (error) {
    errorLog("/updateCust", error);
    next(error);
  }
});

// Updates data of a particular DC
pnrdcRouter.post("/updateSave", async (req, res, next) => {
  const {
    unitName,
    dcNo,
    dcInvNo,
    dcDate,
    dcType,
    dcStatus,
    selectedCustomer,
    custName,
    custCode,
    reference,
    custAddress,
    custState,
    custCity,
    custPin,
    gstNo,
    deliveryAddress,
    deliveryState,
    deliveryContactName,
    deliveryContactNo,
    inspectedBy,
    packedBy,
    selectedMode,
    scrapWeight,
    vehicleDetails,
    eWayRef,
    totalWeight,
    taxableAmount,
    taxAmt,
    tableData,
    selectedTax,
  } = req.body;

  try {
    setupQueryMod(
      `SELECT StateCode FROM magod_setup.state_codelist WHERE State="${deliveryState}"`,
      async (selectErr, selectData) => {
        if (selectErr) {
          errorLog("/updateSave", selectErr);
          return next(selectErr);
        }

        const stateCode = selectData[0]?.StateCode || "";

        misQueryMod(
          `UPDATE magodmis.draft_dc_inv_register
          SET
          Cust_Name = '${custName}',
          PO_No = '${reference}',
          Cust_Address = '${custAddress}',
          Cust_State = '${custState}',
          Cust_Place = '${custCity}',
          PIN_Code = '${custPin}',
          GSTNo = '${gstNo}',
          Del_Address = '${deliveryAddress}',
          InspBy = '${inspectedBy}',
          PackedBy = '${packedBy}',
          TptMode = '${selectedMode}',
          ScarpWt = ${scrapWeight},
          Total_Wt = ${totalWeight},
          VehNo = '${vehicleDetails}',
          Del_ContactName='${deliveryContactName}',
          Del_ContactNo= '${deliveryContactNo}',
          EWayBillRef = '${eWayRef}',
          Del_StateId = '${stateCode}',
          Net_Total = '${taxableAmount}',
          TaxAmount = '${taxAmt}'
          WHERE DC_Inv_No = ${dcInvNo}`,
          async (updateErr, updateData) => {
            if (updateErr) {
              errorLog("/updateSave", updateErr);
              return next(updateErr);
            }

            try {
              for (const row of tableData) {
                const updateDetailsQuery = `
                  UPDATE magodmis.draft_dc_inv_details
                  SET
                  Cust_Code = '${custCode}',
                  Qty = ${row.Qty},
                  DC_Srl_Wt = '${row.DC_Srl_Wt}',
                  Unit_Rate = '${row.Unit_Rate}',
                  DC_Srl_Amt = '${row.DC_Srl_Amt}'
                  WHERE Draft_dc_inv_DetailsID = ${row.Draft_dc_inv_DetailsID} 
                `;

                await misQueryMod(updateDetailsQuery, async (err, data) => {
                  if (err) {
                    errorLog("/updateSave", err);
                    throw err;
                  }
                });
              }

              const deleteTaxQuery = `
                DELETE FROM magodmis.dc_inv_taxtable WHERE Dc_Inv_No = ${dcInvNo}
              `;

              await misQueryMod(deleteTaxQuery, async (err, data) => {
                if (err) {
                  errorLog("/updateSave", err);
                  throw err;
                }

                if (selectedTax.length !== 0) {
                  for (const tax of selectedTax) {
                    const insertTaxQuery = `
                      INSERT INTO magodmis.dc_inv_taxtable (Dc_inv_No, DCTaxId, TaxId, Tax_Name, TaxOn, TaxableAmount, TaxPercent, TaxAmt)
                      VALUES (
                        ${dcInvNo},
                        ${tax.DcTaxID},
                        ${tax.TaxID},
                        '${tax.Tax_Name}',
                        '${tax.TaxOn}',
                        ${tax.TaxableAmount},
                        '${tax.TaxPercent}',
                        '${tax.TaxAmt}'
                      )
                    `;
                    await misQueryMod(insertTaxQuery, async (err, data) => {
                      if (err) {
                        errorLog("/updateSave", err);
                        throw err;
                      }
                    });
                  }
                }
                infoLog("/updateSave");
                res.json({ message: "Data updated successfully" });
              });
            } catch (error) {
              errorLog("/updateSave", error);
              next(error);
            }
          }
        );
      }
    );
  } catch (error) {
    errorLog("/updateSave", error);
    next(error);
  }
});

// Gets data of all materials
pnrdcRouter.get("/materials", async (req, res, next) => {
  try {
    setupQueryMod(
      `SELECT Material, ExciseCLNo FROM magodmis.mtrl_typesList`,
      (err, data) => {
        if (err) errorLog("/materials", err);
        else infoLog("/materials");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/materials", error);
    next(error);
  }
});

// Creates data of a new Delivery Challan
pnrdcRouter.post("/returnDetails", async (req, res, next) => {
  const {
    dcInvNo,
    custCode,
    partName,
    itemDescription,
    material,
    quantity,
    uom,
    unitRate,
    totalValue,
    hsnCode,
    weight,
    returned,
    srlType,
  } = req.body;

  try {
    misQueryMod(
      `SELECT 
      DC_Inv_Srl
  FROM
      magodmis.draft_dc_inv_details
  WHERE
  DC_Inv_No = '${dcInvNo}'
          
  ORDER BY DC_Inv_Srl DESC
  LIMIT 1`,
      (err, data) => {
        if (err) errorLog("/returnDetails", err);

        if (data.length > 0) {
          try {
            misQueryMod(
              `INSERT INTO magodmis.draft_dc_inv_details(DC_Inv_No, DC_Inv_Srl, Cust_Code, Dwg_Code, Dwg_No, Material, Qty, QtyReturned, Excise_CL_no, UOM, DC_Srl_Wt, Unit_Rate, DC_Srl_Amt,  SrlType)
              VALUES('${dcInvNo}', '${
                data[0].DC_Inv_Srl + 1
              }', '${custCode}', '${partName}','${itemDescription}',  '${material}', ${quantity}, ${returned}, '${hsnCode}','${uom}', ${weight}, ${unitRate}, ${totalValue}, '${srlType}')`,
              (err, data) => {
                if (err) errorLog("/returnDetails", err);
              }
            );
            infoLog("/returnDetails");
            res.send({ status: "Inserted" });
          } catch (error) {
            errorLog("/returnDetails", error);
            next(error);
          }
        } else {
          try {
            misQueryMod(
              `INSERT INTO magodmis.draft_dc_inv_details(DC_Inv_No, DC_Inv_Srl, Cust_Code, Dwg_Code, Dwg_No, Material, Qty, QtyReturned, Excise_CL_no, UOM, DC_Srl_Wt, Unit_Rate, DC_Srl_Amt,  SrlType)
              VALUES('${dcInvNo}', '1', '${custCode}', '${partName}','${itemDescription}',  '${material}', ${quantity}, ${returned}, '${hsnCode}'  ,'${uom}', ${weight}, ${unitRate}, ${totalValue}, '${srlType}')`,
              (err, data) => {
                if (err) errorLog("/returnDetails", err);
              }
            );
            infoLog("/returnDetails");
            res.send({ status: "Inserted" });
          } catch (error) {
            errorLog("/returnDetails", error);
            next(error);
          }
        }
      }
    );
  } catch (error) {
    errorLog("/returnDetails", error);
    next(error);
  }
});

// Gets invoice data of a particular Delivery Challan
pnrdcRouter.post("/getTableData", async (req, res, next) => {
  try {
    misQueryMod(
      `select * from magodmis.draft_dc_inv_details  where DC_Inv_No = '${req.body.dcInvNo}'`,
      (err, data) => {
        if (err) errorLog("/getTableData", err);
        else infoLog("/getTableData");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/getTableData", error);
    next(error);
  }
});

// Deletes a detail from a particular Delivery Challan
pnrdcRouter.post("/deleteRow", async (req, res, next) => {
  const { dcInvNo, srl } = req.body;

  try {
    misQueryMod(
      `DELETE FROM magodmis.draft_dc_inv_details WHERE DC_Inv_No = '${dcInvNo}' AND DC_Inv_Srl = ${srl}`,
      async (err, data) => {
        if (err) {
          errorLog("/deleteRow", err);
          return next(err);
        }

        try {
          const selectQuery = `SELECT * FROM magodmis.draft_dc_inv_details WHERE DC_Inv_No = '${dcInvNo}'`;
          misQueryMod(selectQuery, (err, data) => {
            if (err) {
              errorLog("/deleteRow", err);
              return next(err);
            }
            infoLog("/deleteRow");
            res.send(data);
          });
        } catch (error) {
          errorLog("/deleteRow", error);
          next(error);
        }
      }
    );
  } catch (error) {
    errorLog("/deleteRow", error);
    next(error);
  }
});

// Updates Delivery Challan data
pnrdcRouter.post("/createDC", async (req, res, next) => {
  const { dcInvNo, unit, srlType, VoucherNoLength } = req.body;

  const date = new Date();
  const year = date.getFullYear();

  const getYear =
    date.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  const yearParts = getYear.split("-");
  const startYearShort = yearParts[0].slice(-2);
  const endYearShort = yearParts[1].slice(-2);
  const finYear = `${startYearShort}/${endYearShort}`;

  try {
    const prefixQuery = `
    SELECT Prefix, Suffix FROM magod_setup.year_prefix_suffix WHERE SrlType='${srlType}' AND UnitName='${unit}';
    `;

    setupQueryMod(prefixQuery, async (prefixError, prefixResult) => {
      if (prefixError) {
        errorLog("/createDC", prefixError);
        return next(prefixError);
      }

      const prefix =
        prefixResult[0]?.Prefix !== null ? prefixResult[0]?.Prefix : "";
      const suffix =
        prefixResult[0]?.Suffix !== null ? prefixResult[0]?.Suffix : "";

      const selectQuery = `
      SELECT * FROM magod_setup.magod_runningno WHERE SrlType='${srlType}' AND UnitName='${unit}' ORDER BY Id DESC LIMIT 1;
      `;

      setupQueryMod(selectQuery, async (selectError, selectResult) => {
        if (selectError) {
          errorLog("/createDC", selectError);
          return next(selectError);
        }

        let newDCNo = "";

        if (selectResult && selectResult.length > 0) {
          const lastRunNo = selectResult[0].Running_No;
          const numericPart = parseInt(lastRunNo) + 1;
          const paddedNumericPart = numericPart
            .toString()
            .padStart(VoucherNoLength, "0");

          newDCNo = `${prefix}${paddedNumericPart}${suffix}`;

          const updateRunningNoQuery = `
            UPDATE magod_setup.magod_runningno
            SET Running_No = ${numericPart},
            Prefix = '${prefix}',
            Suffix = '${suffix}',
            Running_EffectiveDate = CurDate()
            WHERE SrlType='${srlType}' AND UnitName='${unit}' AND Period='${finYear}';
          `;

          setupQueryMod(updateRunningNoQuery, (updateError, updateResult) => {
            if (updateError) {
              errorLog("/createDC", updateError);
              return next(updateError);
            }
          });
        }

        misQueryMod(
          `UPDATE magodmis.draft_dc_inv_register
          SET DC_Date = curdate(),
          DC_No = '${newDCNo}',
          DC_Fin_Year='${finYear}',
          DCStatus = 'Despatched'
          WHERE DC_Inv_No = '${dcInvNo}'`,
          async (updateError, updateResult) => {
            if (updateError) {
              errorLog("/createDC", updateError);
              return next(updateError);
            }

            const postUpdateSelectQuery = `SELECT * FROM magodmis.draft_dc_inv_register WHERE DC_Inv_No = ${dcInvNo}`;
            misQueryMod(
              postUpdateSelectQuery,
              (postUpdateSelectError, postUpdateSelectResult) => {
                if (postUpdateSelectError) {
                  errorLog("/createDC", postUpdateSelectError);
                  return next(postUpdateSelectError);
                }

                infoLog("/createDC");
                res.json(postUpdateSelectResult);
              }
            );
          }
        );
      });
    });
  } catch (error) {
    errorLog("/createDC", error);
    console.error("An error occurred:", error);
    next(error);
  }
});

// Gets data of Received returns
pnrdcRouter.post("/receiveReturns", async (req, res, next) => {
  const { dcInvNo } = req.body;

  try {
    misQueryMod(
      `SELECT COUNT(*) AS count FROM magodmis.material_receipt_register m
       WHERE m.Ref_VrId = ${dcInvNo} AND m.RVStatus = 'Received'`,
      (err, data) => {
        if (err) {
          errorLog("/receiveReturns", err);
          return next(err);
        }

        let RvId = 0;

        if (data[0].count === 0) {
          misQueryMod(
            `INSERT INTO magodmis.material_receipt_register (Cust_Code, Customer, Ref_VrId, Ref_VrNo, Type, CustGSTNo)
             SELECT d.Cust_Code, d.Cust_Name, d.DC_Inv_No, CONCAT(d.DC_No, ' dt ', DATE_FORMAT(d.DC_Date, '%d/%M/%y')) AS DCRef, 'ReturnableDC', d.GSTNo
             FROM magodmis.draft_dc_inv_register d WHERE d.DC_Inv_No = ${dcInvNo}`,
            (err, data) => {
              if (err) {
                errorLog("/receiveReturns", err);
                return next(err);
              }

              misQueryMod("SELECT LAST_INSERT_ID() AS RvId", (err, data) => {
                if (err) {
                  errorLog("/receiveReturns", err);
                  return next(err);
                }

                RvId = data[0].RvId;

                misQueryMod(
                  `INSERT INTO magodmis.mtrl_returned_details (RvID, RV_SrlId, Part_Name, Part_Discription, DC_Qty, UOM, Qty_Received)
                     SELECT ${RvId}, d.Draft_dc_inv_DetailsID, d.Dwg_Code, d.Dwg_No, d.Qty, d.UOM, d.Qty - d.QtyReturned
                     FROM magodmis.draft_dc_inv_details d WHERE d.DC_Inv_No = ${dcInvNo}`,
                  (err, data) => {
                    if (err) {
                      errorLog("/receiveReturns", err);
                      return next(err);
                    }
                  }
                );
              });
            }
          );
        }

        misQueryMod(
          `SELECT * FROM magodmis.material_receipt_register m
             WHERE m.Ref_VrId = ${dcInvNo} AND m.RVStatus = 'Received'`,
          (err, data) => {
            if (err) {
              errorLog("/receiveReturns", err);
              return next(err);
            }
            infoLog("/receiveReturns");
            res.send(data);
          }
        );
      }
    );
  } catch (error) {
    errorLog("/receiveReturns", error);
    next(error);
  }
});

// Gets data of returned materials in a particular Delivery Challan
pnrdcRouter.post("/firstTable", async (req, res, next) => {
  const { rvId } = req.body;
  try {
    misQueryMod(
      `select * from magodmis.mtrl_returned_details where RvID = '${rvId}'`,
      (err, data) => {
        if (err) errorLog("/firstTable", err);
        else infoLog(`successfully fetched data from mtrl_returned_details`);
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/firstTable", error);
    next(error);
  }
});

// Gets invoice data of a particular Delivery Challan
pnrdcRouter.post("/secondTable", async (req, res, next) => {
  const { dcInvNo } = req.body;
  try {
    misQueryMod(
      `SELECT * FROM magodmis.draft_dc_inv_details WHERE DC_Inv_No=${dcInvNo}`,
      (err, data) => {
        if (err) errorLog("/secondTable", err);
        else infoLog("/secondTable");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/secondTable", error);
    next(error);
  }
});

// Deletes data of returned materials of a particular Delivery Challan
pnrdcRouter.post("/removeFirstTableData", async (req, res, next) => {
  try {
    const { ids, rvId } = req.body;

    const deleteResults = [];

    for (const id of ids) {
      if (id === undefined) {
        errorLog("/removeFirstTableData", "One or more IDs are not present");
        throw new Error("One or more IDs are not present.");
      }

      const deleteQuery = `
        DELETE FROM magodmis.mtrl_returned_details
        WHERE Id = ${id}
      `;

      misQueryMod(deleteQuery, (err, data) => {
        if (err) {
          deleteResults.push({ id, error: "Delete failed." });
        } else {
          deleteResults.push({ id, success: true });
        }
      });
    }

    const selectQuery = `
      SELECT * FROM magodmis.mtrl_returned_details WHERE RvID = ${rvId};
    `;

    misQueryMod(selectQuery, (err, selectData) => {
      if (err) {
        errorLog("/removeFirstTableData", err);
        return res
          .status(500)
          .json({ message: "Error executing SELECT query." });
      } else infoLog("/removeFirstTableData");
      res.json(selectData);
    });
  } catch (error) {
    errorLog("/removeFirstTableData", error);
    console.error("Error:", error.message);
    next(error);
  }
});

// Adds data of returned materials to a particular Delivery Challan
pnrdcRouter.post("/addToFirstTable", async (req, res, next) => {
  try {
    const { rowsToAdd, rvId } = req.body;

    const insertResults = [];
    let existingDraftIds = [];

    const selectQuery = `SELECT Rv_SrlId FROM magodmis.mtrl_returned_details WHERE RvID = ${rvId}`;
    misQueryMod(selectQuery, (selectErr, selectData) => {
      if (selectErr) {
        errorLog("/addToFirstTable", selectErr);
        return res
          .status(500)
          .json({ message: "Error executing SELECT query." });
      }

      existingDraftIds = selectData.map((row) => row.Rv_SrlId);

      for (const row of rowsToAdd) {
        const { Draft_dc_inv_DetailsID } = row;

        if (Draft_dc_inv_DetailsID === undefined) {
          let err1 = "One or more IDs are not present.";
          errorLog("/addToFirstTable", err1);
          throw new Error(err1);
        }

        if (existingDraftIds.includes(Draft_dc_inv_DetailsID)) {
          let err2 = "Draft_dc_inv_DetailsID already exists in the firstTable.";
          insertResults.push({
            id: Draft_dc_inv_DetailsID,
            error: err2,
          });
        } else {
          const insertQuery = `
            INSERT INTO magodmis.mtrl_returned_details
            (RvID, RV_SrlId, Part_Name, Part_Discription, DC_Qty, UOM, Qty_Received)
            SELECT
              ${rvId},
              Draft_dc_inv_DetailsID,
              Dwg_Code,
              Dwg_No,
              Qty,
              UOM,
              Qty - QtyReturned
            FROM magodmis.draft_dc_inv_details 
            WHERE Draft_dc_inv_DetailsID = ${Draft_dc_inv_DetailsID};
          `;

          misQueryMod(insertQuery, (insertErr, insertData) => {
            if (insertErr) {
              insertResults.push({
                id: Draft_dc_inv_DetailsID,
                error: "Insert failed.",
              });
            } else {
              insertResults.push({
                id: Draft_dc_inv_DetailsID,
                success: true,
              });
            }
          });
        }
      }

      const finalSelectQuery = `SELECT * FROM magodmis.mtrl_returned_details WHERE RvID = ${rvId}`;
      misQueryMod(finalSelectQuery, (finalSelectErr, finalSelectData) => {
        if (finalSelectErr) {
          errorLog("/addToFirstTable", finalSelectErr);

          return res
            .status(500)
            .json({ message: "Error executing final SELECT query." });
        }
        infoLog("/addToFirstTable");
        res.json(finalSelectData);
      });
    });
  } catch (error) {
    errorLog("/addToFirstTable", error);
    console.error("Error:", error.message);
    next(error);
  }
});

// Updates data of a particular Delivery Challan
pnrdcRouter.post("/saveJobWork", async (req, res, next) => {
  try {
    const {
      firstTable,
      rvId,
      CustDocuNo,
      CustGSTNo,
      RVStatus,
      UpDated,
      Type,
      Ref_VrId,
      Ref_VrNo,
      CancelReason,
    } = req.body;

    let SrlValue = 1;

    for (const val of firstTable) {
      val.Srl = SrlValue;
      SrlValue += 1;

      const updateQuery1 = `
        UPDATE magodmis.mtrl_returned_details SET RvID = ${val.RvID}, Rv_SrlId =${val.Rv_SrlId}, Srl =${val.Srl}, Part_Name ='${val.Part_Name}',
        Part_Discription='${val.Part_Discription}', DC_Qty =${val.DC_Qty}, 
        UOM ='${val.UOM}', Qty_Received =${val.Qty_Received}, Qty_Inspected =${val.Qty_Inspected}, Qty_Accepted =${val.Qty_Accepted}, Qty_Rejected=${val.Qty_Rejected}
        WHERE Id=${val.Id};
      `;

      misQueryMod(updateQuery1, (err, data) => {
        if (err) {
          errorLog("/saveJobWork", err);
          return next(err);
        }
      });
    }

    const updateQuery2 = `
      UPDATE magodmis.material_receipt_register SET
      CustDocuNo= '${CustDocuNo}',
      CustGSTNo= '${CustGSTNo}',
      RVStatus= '${RVStatus}',
      UpDated= ${UpDated},
      Type= '${Type}',
      Ref_VrId= ${Ref_VrId},
      Ref_VrNo= '${Ref_VrNo}',
      CancelReason= '${CancelReason}'
      WHERE RvID=${rvId};
    `;

    misQueryMod(updateQuery2, (err, data) => {
      if (err) {
        errorLog("/saveJobWork", err);
        return next(err);
      }

      const selectQuery1 = `
        SELECT * FROM magodmis.mtrl_returned_details WHERE RvID = ${rvId};
      `;

      const selectQuery2 = `
        SELECT * FROM magodmis.material_receipt_register WHERE RvID = ${rvId};
      `;

      misQueryMod(selectQuery1, (selectErr1, selectData1) => {
        if (selectErr1) {
          errorLog("/saveJobWork", selectErr1);
          return next(selectErr1);
        }

        misQueryMod(selectQuery2, (selectErr2, selectData2) => {
          if (selectErr2) {
            errorLog("/saveJobWork", selectErr2);
            return next(selectErr2);
          }

          infoLog("/saveJobWork");
          res.json({
            firstTable: selectData1,
            materialReceiptRegister: selectData2,
          });
        });
      });
    });
  } catch (error) {
    errorLog("/saveJobWork", error);
    next(error);
  }
});

// Accepts materials in a particular Delivery Challan
pnrdcRouter.post("/accept", async (req, res, next) => {
  const {
    rvId,
    firstTable,
    dcInvNo,
    ewayBillNo,
    unit,
    srlType,
    VoucherNoLength,
  } = req.body;

  const date = new Date();
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? year : year - 1;

  const getYear =
    date.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  const yearParts = getYear.split("-");
  const yearShort = year.toString().slice(-2);
  const startYearShort = yearParts[0].slice(-2);
  const endYearShort = yearParts[1].slice(-2);
  const finYear = `${startYearShort}/${endYearShort}`;

  try {
    const prefixQuery = `
    SELECT Prefix, Suffix FROM magod_setup.year_prefix_suffix WHERE SrlType='${srlType}' AND UnitName='${unit}';
    `;

    setupQueryMod(prefixQuery, async (prefixError, prefixResult) => {
      if (prefixError) {
        errorLog("/accept", prefixError);
        return next(prefixResult);
      }

      const fetchedPrefix =
        prefixResult[0]?.Prefix !== null ? prefixResult[0]?.Prefix : "";
      const fetchedSuffix =
        prefixResult[0]?.Suffix !== null ? prefixResult[0]?.Suffix : "";

      const selectQuery = `
      SELECT * FROM magod_setup.magod_runningno WHERE SrlType='${srlType}' AND UnitName='${unit}' ORDER BY Id DESC LIMIT 1`;

      setupQueryMod(selectQuery, async (selectError, selectResult) => {
        if (selectError) {
          errorLog("/accept", selectError);
          return next(selectResult);
        }

        let newRvNo = "";

        if (selectResult && selectResult.length > 0) {
          const lastRunNo = selectResult[0].Running_No;
          const numericPart = parseInt(lastRunNo) + 1;

          const paddedNumericPart = numericPart
            .toString()
            .padStart(VoucherNoLength, "0");

          newRvNo = `${yearShort}/${fetchedPrefix}${paddedNumericPart}${fetchedSuffix}`;

          const updateRunningNoQuery = `
            UPDATE magod_setup.magod_runningno
            SET Running_No = ${numericPart},
            Prefix = '${fetchedPrefix}',
            Suffix = '${fetchedSuffix}',
            Running_EffectiveDate = CurDate()
            WHERE SrlType='${srlType}' AND UnitName='${unit}' AND Period='${finYear}';
          `;

          setupQueryMod(updateRunningNoQuery, (updateError, updateResult) => {
            if (updateError) {
              errorLog("/accept", updateError);
              return next(updateResult);
            }
          });
        }

        misQueryMod(
          `UPDATE magodmis.material_receipt_register
          SET RV_No='${newRvNo}', RV_Date=CURDATE(), RVStatus='Updated', EwayBillRef = '${ewayBillNo}'
          WHERE RvID=${rvId}`,
          async (updateError, updateResult) => {
            if (updateError) {
              errorLog("/accept", updateError);
              return next(updateResult);
            }

            const postUpdateSelectQuery = `SELECT * FROM magodmis.material_receipt_register WHERE RvID = ${rvId}`;
            misQueryMod(
              postUpdateSelectQuery,
              (postUpdateSelectError, postUpdateSelectResult) => {
                if (postUpdateSelectError) {
                  errorLog("/accept", postUpdateSelectError);
                  return next(postUpdateSelectResult);
                }

                const updatedRVNo = postUpdateSelectResult[0].RV_No;
                const updatedRvDate = postUpdateSelectResult[0].RV_Date;
                const updatedRvStatus = postUpdateSelectResult[0].RVStatus;

                for (const val of firstTable) {
                  const updateQuery2 = `
                  UPDATE magodmis.draft_dc_inv_details
                  SET QtyReturned = (
                    SELECT SUM(m.Qty_Received) as qtyReceived
                    FROM magodmis.mtrl_returned_details m
                    INNER JOIN magodmis.material_receipt_register m1 ON m1.RVId = m.RVId
                    WHERE m.Rv_SrlId = ${val.Rv_SrlId} AND m1.RVStatus = 'Updated'
                  )
                  WHERE Draft_dc_inv_DetailsID = ${val.Rv_SrlId};
                `;

                  misQueryMod(updateQuery2, (err, data) => {
                    if (err) {
                      errorLog("/accept", err);
                      return next(err);
                    }
                  });
                }

                const updateQuery3 = `
            UPDATE magodmis.draft_dc_inv_register d
            SET d.DcStatus =
              CASE
                WHEN (
                  SELECT SUM(OpenSrlCount) as OpenSrlCount
                  FROM (
                    SELECT
                      CASE WHEN GREATEST(CAST(d.Qty AS SIGNED) - CAST(d.QtyReturned AS SIGNED), 0) > 0 THEN 1 ELSE 0 END as OpenSrlCount
                    FROM magodmis.draft_dc_inv_details d
                    WHERE d.DC_Inv_No = ${dcInvNo}
                  ) as b
                ) = 0 THEN 'Closed'
                ELSE 'Despatched'
              END
            WHERE d.DC_Inv_No = ${dcInvNo};
            
            `;

                misQueryMod(updateQuery3, (err, data) => {
                  if (err) {
                    errorLog("/accept", err);
                    return next(err);
                  }

                  const selectQuery2 = `
                SELECT * FROM magodmis.draft_dc_inv_details WHERE DC_Inv_No = ${dcInvNo}
              `;

                  misQueryMod(selectQuery2, (err, draftDetailsData) => {
                    if (err) {
                      errorLog("/accept", err);
                      return next(err);
                    }

                    const draft_dc_inv_details = draftDetailsData;

                    const selectQuery3 = `
                  SELECT * FROM magodmis.draft_dc_inv_register WHERE DC_Inv_No = ${dcInvNo};
                `;

                    misQueryMod(
                      selectQuery3,
                      (selectErr, draftRegisterData) => {
                        if (selectErr) {
                          errorLog("/accept", selectErr);
                          return next(selectErr);
                        }

                        const draft_dc_inv_register = draftRegisterData;

                        infoLog("/accept");
                        res.send({
                          updatedRVNo,
                          updatedRvDate,
                          updatedRvStatus,
                          draft_dc_inv_details,
                          draft_dc_inv_register,
                        });
                      }
                    );
                  });
                });
              }
            );
          }
        );
      });
    });
  } catch (error) {
    errorLog("/accept", error);
    next(error);
  }
});

// Gets data of a particular receive
pnrdcRouter.post("/receiveTable", async (req, res, next) => {
  const { rvId, Ref_VrId } = req.body;

  try {
    misQueryMod(
      `select * from magodmis.material_receipt_register where Ref_VrId = ${Ref_VrId}`,
      (err, data) => {
        if (err) errorLog("/receiveTable", err);
        else infoLog("/receiveTable");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/receiveTable", error);
    next(error);
  }
});

// Cancels a material in a particular Delivery Challan
pnrdcRouter.post("/cancel", async (req, res, next) => {
  const { rvId, firstTable, dcInvNo, CancelReason } = req.body;

  try {
    misQueryMod(
      `UPDATE magodmis.material_receipt_register
        SET RVStatus='Cancelled',
        CancelReason = '${CancelReason}'
        WHERE RvID=${rvId}`,
      async (updateError, updateResult) => {
        if (updateError) {
          errorLog("/cancel", updateError);
          return next(updateResult);
        }

        const postUpdateSelectQuery = `SELECT * FROM magodmis.material_receipt_register WHERE RvID = ${rvId}`;
        misQueryMod(
          postUpdateSelectQuery,
          async (postUpdateSelectError, postUpdateSelectResult) => {
            if (postUpdateSelectError) {
              errorLog("/cancel", postUpdateSelectError);
              return next(postUpdateSelectResult);
            }

            const updatedRVNo = postUpdateSelectResult[0].RV_No;
            const updatedRvDate = postUpdateSelectResult[0].RV_Date;
            const updateRvStatus = postUpdateSelectResult[0].RVStatus;

            for (const val of firstTable) {
              const updateQuery2 = `
              UPDATE magodmis.draft_dc_inv_details 
              SET QtyReturned = COALESCE(
                (
                  SELECT SUM(m.Qty_Received) as qtyReceived 
                  FROM magodmis.mtrl_returned_details m, magodmis.material_receipt_register m1
                  WHERE m.Rv_SrlId=${val.Rv_SrlId} AND m1.RVId=m.RVId AND m1.RVStatus='Updated'
                ),
                0  
              )
              WHERE Draft_dc_inv_DetailsID=${val.Rv_SrlId};
              
              `;

              misQueryMod(updateQuery2, (err, data) => {
                if (err) {
                  errorLog("/cancel", err);
                  console.error("data", data);
                  return next(err);
                }
              });
            }

            const updateQuery3 = `
              UPDATE magodmis.draft_dc_inv_register d,
              (SELECT SUM(OpenSrlCount) as OpenSrlCount FROM
                (SELECT CASE WHEN d.qty-d.QtyReturned>0 THEN 1 ELSE 0 END as OpenSrlCount
                FROM magodmis.draft_dc_inv_details d
                WHERE d.DC_Inv_No=${dcInvNo}) as b) as A
              SET d.DcStatus=CASE WHEN a.OpenSrlCount=0 THEN 'Closed' ELSE 'Despatched' END
              WHERE d.DC_Inv_No=${dcInvNo};
            `;

            misQueryMod(updateQuery3, (err, data) => {
              if (err) {
                errorLog("/cancel", err);
                return next(err);
              }

              const selectQuery2 = `
                SELECT * FROM magodmis.draft_dc_inv_details WHERE DC_Inv_No = ${dcInvNo}
              `;

              misQueryMod(selectQuery2, (err, draftDetailsData) => {
                if (err) {
                  errorLog("/cancel", err);
                  return next(err);
                }

                const draft_dc_inv_details = draftDetailsData;

                const selectQuery3 = `
                  SELECT * FROM magodmis.draft_dc_inv_register WHERE DC_Inv_No = ${dcInvNo};
                `;

                misQueryMod(selectQuery3, (selectErr, draftRegisterData) => {
                  if (selectErr) {
                    errorLog("/cancel", selectErr);
                    return next(selectErr);
                  }

                  const draft_dc_inv_register = draftRegisterData;

                  infoLog("/cancel");
                  res.send({
                    updatedRVNo,
                    updatedRvDate,
                    updateRvStatus,
                    draft_dc_inv_details,
                    draft_dc_inv_register,
                  });
                });
              });
            });
          }
        );
      }
    );
  } catch (error) {
    errorLog("/cancel", error);
    next(error);
  }
});

// Cancels a particular Delivery Challan
pnrdcRouter.post("/dcCancel", async (req, res, next) => {
  try {
    const { dcInvNo, dcCancel } = req.body;

    const updateQuery = `UPDATE magodmis.draft_dc_inv_register SET DCStatus = 'Cancelled', 
    DC_CancelReason = '${dcCancel}'
    WHERE DC_Inv_No=${dcInvNo}`;

    misQueryMod(updateQuery, (err, data) => {
      if (err) {
        errorLog("/dcCancel", err);
        return next(err);
      } else {
      }
    });

    const selectQuery = `
    select * from magodmis.draft_dc_inv_register WHERE DC_Inv_No=${dcInvNo}
    `;

    misQueryMod(selectQuery, (err, data) => {
      if (err) {
        errorLog("/dcCancel", err);
      } else {
        infoLog("/dcCancel");
      }
      res.send(data);
    });
  } catch (error) {
    errorLog("/dcCancel", error);
    next(error);
  }
});

// Gets data of all drafted delivery challans
pnrdcRouter.get("/dcDraft", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT * FROM magodmis.draft_dc_inv_register where DC_InvType = 'ReturnableDC' and IsDC = 1 and DCStatus = 'Draft'`,
      (err, data) => {
        if (err) errorLog("/dcDraft", err);
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/dcDraft", error);
    next(error);
  }
});

// Gets data of all dispatched delivery challans
pnrdcRouter.get("/dcDespatched", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT * FROM magodmis.draft_dc_inv_register where DC_InvType = 'ReturnableDC' and IsDC = 1 and DCStatus = 'Despatched'`,
      (err, data) => {
        if (err) errorLog("/dcDespatched", err);
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/dcDespatched", error);
    next(error);
  }
});

// Gets data of all closed delivery challans
pnrdcRouter.get("/dcClosed", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT * FROM magodmis.draft_dc_inv_register where DC_InvType = 'ReturnableDC' and IsDC = 1 and DCStatus = 'Closed'`,
      (err, data) => {
        if (err) errorLog("/dcClosed", err);
        else infoLog("/dcClosed");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/dcClosed", error);
    next(error);
  }
});

// Gets data of all delivery challans
pnrdcRouter.get("/dcAll", async (req, res, next) => {
  try {
    misQueryMod(
      `SELECT * 
      FROM magodmis.draft_dc_inv_register 
      WHERE DC_InvType = 'ReturnableDC' 
        AND IsDC = 1 
        AND (DCStatus = 'Despatched' OR DCStatus = 'Closed' OR DCStatus = 'Cancelled');`,
      (err, data) => {
        if (err) errorLog("/dcAll", err);
        else infoLog("/dcAll");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/dcAll", error);
    next(error);
  }
});

// Gets all data for creating new delivery challan
pnrdcRouter.post("/allCreateNewData", async (req, res, next) => {
  const { dcInvNo, Del_StateId } = req.body;

  try {
    misQueryMod(
      `SELECT * FROM magodmis.draft_dc_inv_details WHERE DC_Inv_no = ${dcInvNo}`,
      (err, draft_dc_inv_details) => {
        if (err) {
          errorLog("/allCreateNewData", err);
          return next(err);
        }

        misQueryMod(
          `SELECT * FROM magodmis.material_receipt_register WHERE Ref_VrId = ${dcInvNo}`,
          (err, material_receipt_register) => {
            if (err) {
              errorLog("/allCreateNewData", err);
              return next(err);
            }

            misQueryMod(
              `SELECT * FROM magodmis.dc_inv_taxtable WHERE DC_Inv_no = '${dcInvNo}'`,
              (err, dc_inv_taxtable) => {
                if (err) {
                  errorLog("/allCreateNewData", err);
                  return next(err);
                }

                setupQueryMod(
                  `SELECT State FROM magod_setup.state_codelist WHERE StateCode='${Del_StateId}';`,
                  (err, state_codelist) => {
                    if (err) {
                      errorLog("/allCreateNewData", err);
                      return next(err);
                    }

                    misQueryMod(
                      `select * from magodmis.draft_dc_inv_register where DC_Inv_No = ${dcInvNo}`,
                      (err, draft_dc_inv_register) => {
                        if (err) {
                          errorLog("/allCreateNewData", err);
                          return next(err);
                        }

                        infoLog("/allCreateNewData");

                        const responseData = {
                          draft_dc_inv_details,
                          material_receipt_register,
                          dc_inv_taxtable,
                          state_codelist,
                          draft_dc_inv_register,
                        };

                        res.send(responseData);
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    errorLog("/allCreateNewData", error);
    next(error);
  }
});

module.exports = pnrdcRouter;
