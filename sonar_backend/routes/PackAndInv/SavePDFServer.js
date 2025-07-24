const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  baseUploadFolder,
  baseUploadPath,
  orderLessUploadPath,
  pdfPathConfig,
} = require("../../helpers/PDFPathConfig");
const { errorLog, infoLog } = require("../../helpers/logger");
const { setupQueryMod } = require("../../helpers/dbconn");
require("dotenv").config();

let OrderNOO;
let Type;
let globalAdjustmentName;

const savePDF = express.Router();

savePDF.post("/getFolderPath", (req, res) => {});

const customPDFlist = pdfPathConfig.map((conf) => conf.name);

//Formats date and time
const getFormattedDateTime = () => {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  return `${date}_${time}`;
};

// Dynamically Configures Paths
function returnFinalPaths(orderNo, type) {
  const baseHierarchy = [baseUploadFolder, baseUploadPath, orderNo?.toString()];
  const orderLessHierarchy = [baseUploadFolder, orderLessUploadPath];

  const pdfObject = pdfPathConfig.find((config) => config.name === type);

  return pdfObject
    ? [...orderLessHierarchy, pdfObject.subFolder]
    : baseHierarchy;
}

// Joins configured paths
function joinPaths(orderNo, type) {
  const pathHierarchy = returnFinalPaths(orderNo, type);
  return path.join(...pathHierarchy);
}

// Gets File path and Sets filename for a particular report
savePDF.post("/set-adjustment-name", (req, res) => {
  const { adjustment, OrderNo, type, setUpPara } = req.body;

  setupQueryMod(
    `SELECT * FROM magod_setup.setupdetails WHERE SetUpPara = "${setUpPara}"`,
    (err, pathData) => {
      if (err) {
        errorLog("/set-adjustment-name", err);
        res.json({ error: err.message });
        return;
      }

      let basefolderPath = pathData[0].SetUpValue;

      Type = type;
      OrderNOO = req.body.OrderNo;

      if (!customPDFlist.includes(type) && (!adjustment || !OrderNo)) {
        let required = [];

        const valArray = [
          { name: "Adjustment name", value: adjustment || "" },
          { name: "OrderNo", value: OrderNo || "" },
        ];

        valArray.forEach((array, i) => {
          if (!array.value) {
            required.push(array.name);
          }
        });

        let errMsg = `${[...required]} ${
          required.length > 1 ? "are" : "is"
        } required`;

        errorLog("/set-adjustment-name", errMsg);
        return res.status(400).send({
          message: errMsg,
        });
      }

      globalAdjustmentName = adjustment;

      const uploadFolder = joinPaths(OrderNo, type);
      if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder, { recursive: true });
      }

      infoLog("/set-adjustment-name");
      res
        .status(200)
        .send({ message: "Adjustment name saved successfully.", uploadFolder });
    }
  );
});

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = Type;

    const orderPath = joinPaths(OrderNOO, type);

    if (!fs.existsSync(orderPath)) {
      fs.mkdirSync(orderPath, { recursive: true });
    }

    cb(null, orderPath);
  },
  filename: (req, file, cb) => {
    const dateTime = getFormattedDateTime();
    const ext = path.extname(file.originalname);
    cb(null, `${globalAdjustmentName}${ext}`);
  },
});

// Saves PDF report
savePDF.post("/save-pdf", (req, res) => {
  const upload = multer({ storage }).single("file");

  upload(req, res, (err) => {
    if (err) {
      errorLog("save-pdf", err);
      console.error("File upload error:", err);
      return res
        .status(500)
        .send({ message: "File upload failed", error: err });
    }

    infoLog("save-pdf");
    res
      .status(200)
      .send({ message: "PDF saved successfully!", filePath: req.file.path });
  });
});

module.exports = savePDF;
