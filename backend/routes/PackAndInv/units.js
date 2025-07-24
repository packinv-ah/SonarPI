const pnunitRouter = require("express").Router();
const { setupQuery } = require("../../helpers/dbconn");
const { errorLog, infoLog } = require("../../helpers/logger");

// Gets data of all units
pnunitRouter.post("/allunits", async (req, res, next) => {
  try {
    setupQuery(
      "SELECT UnitID,UnitName,Unit_Address FROM magod_setup.magodlaser_units where Current = '1'",
      (data) => {
        infoLog("/allunits");
        res.send(data);
      }
    );
  } catch (error) {
    errorLog("/allunits", error);
    next(error);
  }
});

module.exports = pnunitRouter;
