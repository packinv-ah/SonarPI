var mysql = require("mysql2");
require("dotenv").config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPort = process.env.DB_PORT;
const dbPassword = process.env.DB_PASSWORD;
const dbDatabase1 = process.env.DB_DATABASE_1; //magodmis
const dbDatabase2 = process.env.DB_DATABASE_2; //magod_setup
const dbDatabase3 = process.env.DB_DATABASE_3; //magodqtn
const dbDatabase4 = process.env.DB_DATABASE_4; //machine_data
const dbDatabase5 = process.env.DB_DATABASE_5; //magod_sales
const dbDatabase6 = process.env.DB_DATABASE_6; //magod_mtrl

// Creating connections for the above mentioned databases
var misConn = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  port: dbPort,
  password: dbPassword,
  database: dbDatabase1,
});

var setupConn = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  port: dbPort,
  password: dbPassword,
  database: dbDatabase2,
});

var qtnConn = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  port: dbPort,
  password: dbPassword,
  database: dbDatabase3,
});

var mchConn = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  port: dbPort,
  password: dbPassword,
  database: dbDatabase4,
});

var slsConn = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  port: dbPort,
  password: dbPassword,
  database: dbDatabase5,
});

var mtrlConn = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  port: dbPort,
  password: dbPassword,
  database: dbDatabase6,
});

// Connection and Query Execution Function for magodmis db
let misQuery = async (q, callback) => {
  misConn.connect();
  misConn.query(q, (err, res, fields) => {
    if (err) throw err;
    callback(res);
  });
};

// Modified Connection and Query Execution Function for magodmis db with callback filter
let misQueryMod = async (q, callback) => {
  try {
    misConn.connect((connectErr) => {
      if (connectErr) {
        if (typeof callback === "function") {
          callback(connectErr, null);
        } else {
          console.error("Callback is not a function.");
        }
        return;
      }

      misConn.query(q, (err, res, fields) => {
        if (typeof callback === "function") {
          if (err) {
            callback(err, null);
          } else {
            callback(null, res);
          }
        } else {
          console.error("Callback is not a function.");
        }
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);

    if (typeof callback === "function") {
      callback(error, null);
    } else {
      console.error("Callback is not a function.");
    }
  }
};

// Connection and Query Execution Function for magod_mtrl db with error callback
let mtrlQueryMod = async (m, callback) => {
  mtrlConn.connect();
  mtrlConn.query(m, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

// Connection and Query Execution Function for magod_setup db
let setupQuery = (q, callback) => {
  setupConn.connect();
  setupConn.query(q, (err, res, fields) => {
    if (err) throw err;
    callback(res);
  });
};

// Modified Connection and Query Execution Function for magod_setup db with error callback
let setupQueryMod = async (q, callback) => {
  setupConn.connect();
  setupConn.query(q, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

// Connection and Query Execution Function for magodqtn db
let qtnQuery = (q, callback) => {
  qtnConn.connect();
  qtnConn.query(q, (err, res, fields) => {
    if (err) throw err;
    callback(res);
  });
};

// Modified Connection and Query Execution Function for magodqtn db with error callback
let qtnQueryMod = (q, callback) => {
  qtnConn.connect();
  qtnConn.query(q, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

// Modified Connection and Query Execution Function for magodqtn db with values param
let qtnQueryModv2 = (q, values, callback) => {
  qtnConn.connect();
  qtnConn.query(q, values, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

// Modified Connection and Query Execution Function for magod_sales db
let slsQueryMod = (s, callback) => {
  slsConn.connect();
  slsConn.query(s, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

// Modified Connection and Query Execution Function for machine_data db
let mchQueryMod = (m, callback) => {
  mchConn.connect();
  mchConn.query(m, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

module.exports = {
  misQuery,
  setupQuery,
  qtnQuery,
  misQueryMod,
  qtnQueryMod,
  qtnQueryModv2,
  slsQueryMod,
  mchQueryMod,
  mtrlQueryMod,
  setupQueryMod,
};
