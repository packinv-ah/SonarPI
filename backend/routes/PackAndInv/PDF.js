const PDFRouter = require("express").Router();
const { setupQueryMod } = require("../../helpers/dbconn");
const { errorLog, infoLog } = require("../../helpers/logger");

// Fetches data for PDF
PDFRouter.post("/getPDFData", async (req, res, next) => {
  let { unitName } = req.body;

  try {
    setupQueryMod(
      `SELECT * FROM magod_setup.magodlaser_units WHERE UnitName = "${unitName}"`,
      (err, pdfData) => {
        if (err) {
          errorLog("/getPDFData", err);
          console.error("err", err);
        } else {
          infoLog("/getPDFData");
          res.send(pdfData);
        }
      }
    );
  } catch (error) {
    errorLog("/getPDFData", error);
    next(error);
  }
});

module.exports = PDFRouter;
