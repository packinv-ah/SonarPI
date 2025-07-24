require("dotenv").config();

let baseUploadFolder =
  process.env.FILE_SERVER_PATH?.trim() || "C:/Magod/Jigani";

let baseUploadPath = "Wo";
let orderLessUploadPath = "Wo";

let pdfPathConfig = [
  { name: "Misc Sales", subFolder: "Misc Invoices" },
  { name: "Material Scrap Sales", subFolder: "Scrap Invoices" },
];

module.exports = {
  baseUploadFolder,
  baseUploadPath,
  orderLessUploadPath,
  pdfPathConfig,
};
