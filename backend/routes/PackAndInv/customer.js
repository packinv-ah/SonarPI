const pncustomerRouter = require("express").Router();
const { misQueryMod } = require("../../helpers/dbconn");
const { errorLog, infoLog } = require("../../helpers/logger");

// Get all customers
pncustomerRouter.post("/allcustomers", async (req, res, next) => {
  try {
    misQueryMod(
      "Select * from magodmis.cust_data order by Cust_name asc",
      (err, data) => {
        if (err) errorLog("/allcustomers", err);
        else infoLog("/allcustomers");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/allcustomers", error);
    next(error);
  }
});

module.exports = pncustomerRouter;
