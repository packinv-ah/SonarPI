const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const pnuserRouter = require("./routes/PackAndInv/user");
const pnunitRouter = require("./routes/PackAndInv/units");
const pncustomerRouter = require("./routes/PackAndInv/customer");
const { errorLog } = require("./helpers/logger");
const customerdataRouter = require("./routes/PackAndInv/CustomerData");
const pnProfileRouter = require("./routes/PackAndInv/PNProfile");
const pnrdcRouter = require("./routes/PackAndInv/ReturnableDC");
const InvoiceRouter = require("./routes/PackAndInv/Invoice");
const inspectionProfileRouter = require("./routes/PackAndInv/InspectionProfile");
const PDFRouter = require("./routes/PackAndInv/PDF");
const RunningNoRouter = require("./routes/PackAndInv/RunningNo");
const savePDF = require("./routes/PackAndInv/SavePDFServer");

// Handling data formats
app.use(cors());
app.use(bodyParser.json());

// Middleware Routes for logging requests
app.use("/packuser", pnuserRouter);
app.use("/packunits", pnunitRouter);
app.use("/packcustomers", pncustomerRouter);
app.use("/customerdata", customerdataRouter);
app.use("/pnprofile", pnProfileRouter);
app.use("/pnrdc", pnrdcRouter);
app.use("/invoice", InvoiceRouter);
app.use("/inspection", inspectionProfileRouter);
app.use("/pdf", PDFRouter);
app.use("/runningNo", RunningNoRouter);
app.use("/savePDF", savePDF);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
  errorLog("/", err);
});

// Server Listening and Inititalization Check
app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
