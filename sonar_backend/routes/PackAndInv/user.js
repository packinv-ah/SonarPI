const pnuserRouter = require("express").Router();
const CryptoJS = require("crypto-js");
const { setupQuery, setupQueryMod } = require("../../helpers/dbconn");
const { errorLog, infoLog } = require("../../helpers/logger");

var createError = require("http-errors");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

// Saves Menu mapping info in DB
pnuserRouter.post(`/savemenurolemapping`, async (req, res, next) => {
  let sucs = false;
  let updt = false;
  let nomenu = false;
  let inRole = "";
  try {
    let data = req.body.newselectedmenu;
    let msg = "";
    if (data.length > 0) {
      await setupQueryMod(
        `Select * from magod_setup.menumapping where Role = '${data[0]["role"]}'`,
        async (err, dr) => {
          if (err) errorLog(`/savemenurolemapping`, err);
          inRole = dr["Role"];
        }
      );
    }

    if (inRole != null) {
      await setupQueryMod(
        `UPDATE magod_setup.menumapping SET ActiveMenu = 0 WHERE Role = '${data[0]["role"]}'`,
        async (err, mapdata) => {
          if (err) errorLog(`/savemenurolemapping`, err);
        }
      );

      for (let i = 0; i < data.length; i++) {
        await setupQueryMod(
          `Select Id from magod_setup.menus where MenuName = '${data[i]["MenuName"]}'`,
          async (err, menuid) => {
            if (err) errorLog(`/savemenurolemapping`, err);
            if (menuid.length > 0) {
              setupQueryMod(
                `UPDATE magod_setup.menumapping SET ActiveMenu = 1 WHERE Role = '${data[i]["role"]}' And MenuId = '${menuid[0]["Id"]}'`,
                async (err, dmp) => {
                  if (err) errorLog(`/savemenurolemapping`, err);
                  if (dmp.affectedRows > 0) {
                    msg = "updated";
                  } else if (dmp.affectedRows == 0) {
                    await setupQueryMod(
                      `Select Id from magod_setup.menus where MenuName = '${data[i]["MenuName"]}'`,
                      async (err, menuid) => {
                        if (err) errorLog(`/savemenurolemapping`, err);
                        if (menuid.length > 0) {
                          await setupQueryMod(
                            `INSERT INTO magod_setup.menumapping (Role, MenuId, ActiveMenu) VALUES ('${data[i]["role"]}', '${menuid[0]["Id"]}', '1')`,
                            async (err, ins) => {
                              if (err) errorLog(`/savemenurolemapping`, err);
                              msg = "success";
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
      infoLog(`/savemenurolemapping`);
      res.send({ status: msg });
    } else if (dr.length == 0) {
      for (let i = 0; i < data.length; i++) {
        await setupQueryMod(
          `Select Id from magod_setup.menus where MenuName = '${data[i]["MenuName"]}'`,
          async (err, menuid) => {
            if (err) errorLog(`/savemenurolemapping`, err);
            if (menuid.length > 0) {
              await setupQueryMod(
                `INSERT INTO magod_setup.menumapping (Role, MenuId, ActiveMenu) VALUES ('${data[i]["role"]}', '${menuid[0]["Id"]}', '1')`,
                async (err, ins) => {
                  if (err) errorLog(`/savemenurolemapping`, err);
                  msg = "success";
                }
              );
            }
          }
        );
      }
      infoLog(`/savemenurolemapping`);
      res.send({ status: msg });
    }
  } catch (error) {
    errorLog(`/savemenurolemapping`, error);
    console.error(error);
    next(error);
  }
});

// Deletes data of a particular user
pnuserRouter.post(`/delusers`, async (req, res, next) => {
  try {
    let usrname = req.body.uname;
    setupQueryMod(
      `Update magod_setup.magod_userlist set ActiveUser = 0 where UserName = '${usrname}'`,
      (err, data) => {
        if (err) errorLog(`/delusers`, err);
        if (data.affectedRows > 0)
          setupQueryMod(
            `Select usr.Name, usr.UserName,usr.Role, unt.UnitName from magod_setup.magod_userlist usr
                left join magod_setup.magodlaser_units unt on unt.UnitID = usr.UnitID where usr.ActiveUser= 1`,
            async (err, d) => {
              if (err) errorLog(`/delusers`, err);
              else infoLog(`/delusers`);
              msg = "success";
              res.send({ d, status: msg });
            }
          );
      }
    );
  } catch (error) {
    errorLog(`/delusers`, error);
    next(error);
  }
});

// Saves user data
pnuserRouter.post(`/saveusers`, async (req, res, next) => {
  try {
    let data = req.body.usrdata;
    let passwrd = CryptoJS.SHA512(data.Password);
    let msg = "";
    setupQueryMod(
      `SELECT Name,UserName,PassWord FROM magod_setup.magod_userlist WHERE UserName = '${data.UserName}'`,
      async (err, d) => {
        if (err) errorLog(`/saveusers`, err);
        if (d.length == 0) {
          let sql = `INSERT INTO magod_setup.magod_userlist (Name,UserName,ActiveUser,ResetPassword,UserPassWord,CreatedTime,Role,Password,UnitID) 
                    VALUES ('${data.Name}','${data.UserName}','1','0','',Current_TimeStamp,'${data.Role}','${passwrd}','${data.Unit}')`;
          setupQueryMod(sql, async (err, d) => {
            if (err) errorLog(`/saveusers`, err);
            if (d.affectedRows > 0)
              setupQueryMod(
                `Select usr.Name, usr.UserName,usr.Role, unt.UnitName from magod_setup.magod_userlist usr
                        left join magod_setup.magodlaser_units unt on unt.UnitID = usr.UnitID where usr.ActiveUser= 1`,
                async (err, d) => {
                  if (err) errorLog(`/saveusers`, err);
                  else infoLog(`/saveusers`);
                  msg = "success";
                  res.send({ d, status: msg });
                }
              );
          });
        } else {
          let sql = `Update magod_setup.magod_userlist set Name='${data.Name}',ActiveUser='1',ResetPassword='0'
                ,UserPassWord='',Role='${data.Role}',Password='${passwrd}',UnitID='${data.Unit}' where UserName='${data.UserName}'`;
          setupQueryMod(sql, async (err, d) => {
            if (err) errorLog(`/saveusers`, err);
            if (d.affectedRows > 0)
              setupQueryMod(
                `Select usr.Name, usr.UserName,usr.Role, unt.UnitName from magod_setup.magod_userlist usr
                                    left join magod_setup.magodlaser_units unt on unt.UnitID = usr.UnitID where usr.ActiveUser= 1`,
                async (err, d) => {
                  if (err) errorLog(`/saveusers`, err);
                  else infoLog(`/saveusers`);
                  msg = "updated";
                  res.send({ d, status: msg });
                }
              );
          });
        }
      }
    );
  } catch (error) {
    errorLog(`/saveusers`, error);
    next(error);
  }
});

// Gets user roles data
pnuserRouter.post(`/getuserroles`, async (req, res, next) => {
  try {
    setupQueryMod(`Select * FROM magod_setup.userroles`, async (err, data) => {
      if (err) errorLog(`/getuserroles`, err);
      else infoLog(`/getuserroles`);
      res.send(data);
    });
  } catch (error) {
    errorLog(`/getuserroles`, error);
    next(error);
  }
});

// Adds user role
pnuserRouter.post(`/adduserroles`, async (req, res, next) => {
  try {
    const strrole = req.body.usrroledata.Role;
    setupQueryMod(
      `Select * from magod_setup.userroles where Role ='${strrole}'`,
      async (err, datarole) => {
        if (err) errorLog(`/adduserroles`, err);
        if (datarole.length == 0) {
          setupQueryMod(
            `INSERT INTO magod_setup.userroles (Role) VALUES ('${strrole}')`,
            async (err, data) => {
              if (err) errorLog(`/adduserroles`, err);
              res.send({ status: "success" });
            }
          );
        } else {
          infoLog(`/adduserroles`);
          res.send({ status: "updated" });
        }
      }
    );
  } catch (error) {
    errorLog(`/adduserroles`, error);
    next(error);
  }
});

// Deletes user role
pnuserRouter.post(`/deluserroles`, async (req, res, next) => {
  try {
    let oldrole = req.body.rolenm;

    setupQueryMod(
      `Update magod_setup.menumapping set ActiveMenu = 0 where Role = '${oldrole}'`,
      (err, mmdata) => {
        if (err) errorLog(`/deluserroles`, err);
      }
    );
    setupQueryMod(
      `Delete from magod_setup.userroles where Role='${oldrole}'`,
      (err, data) => {
        if (err) errorLog(`/deluserroles`, err);
        else infoLog(`/deluserroles`);
        res.send({ status: "Deleted" });
      }
    );
  } catch (error) {
    errorLog(`/deluserroles`, error);
    next(error);
  }
});

// Gets menus for a particular role
pnuserRouter.post(`/getrolemenus`, async (req, res, next) => {
  const strrole = req.body.Role;
  try {
    setupQueryMod(
      `Select mm.role, m.MenuName FROM magod_setup.menumapping mm
        left outer join magod_setup.menus m on m.Id = mm.MenuId
        where mm.Role = '${strrole}' and mm.ActiveMenu = '1'`,
      async (err, data) => {
        if (err) errorLog(`/getrolemenus`, err);
        else infoLog(`/getrolemenus`);
        res.send(data);
      }
    );
  } catch (error) {
    errorLog(`/getrolemenus`, error);
    next(error);
  }
});

// Deactivates a particular menu
pnuserRouter.post(`/delusermenus`, async (req, res, next) => {
  try {
    let mnuname = req.body.mname;
    setupQueryMod(
      `Update magod_setup.menus set ActiveMenu = '0' where MenuName = '${mnuname}'`,
      (err, data) => {
        if (err) errorLog(`/delusermenus`, err);
        else infoLog(`/delusermenus`);
        res.send({ status: "Deleted" });
      }
    );
  } catch (error) {
    errorLog(`/delusermenus`, err);
    next(error);
  }
});

// Updates existing menu or adds new menu
pnuserRouter.post(`/addusermenus`, async (req, res, next) => {
  let msg = "";
  try {
    const strmenu = req.body.menu.MenuName;
    const strurl = req.body.menu.MenuUrl;

    if (strmenu != null && strurl != null) {
      setupQueryMod(
        `Select * from magod_setup.menus where MenuName ='${strmenu}'`,
        async (err, data) => {
          if (err) errorLog(`/addusermenus`, err);

          if (data.length > 0) {
            setupQueryMod(
              `Update magod_setup.menus set MenuUrl = '${data[0]["MenuUrl"]}' where MenuName ='${data[0]["MenuName"]}'`,
              async (err, updata) => {
                if (err) errorLog(`/addusermenus`, err);
                else infoLog(`/addusermenus`);
                res.send({ status: "Updated" });
              }
            );
          } else {
            setupQuery(
              `INSERT INTO magod_setup.menus (MenuName, MenuUrl,ActiveMenu) VALUES ('${strmenu}','${strurl}','1')`,
              async (data) => {
                if (data.affectedRows > 0) {
                  setupQuery(
                    `Select m.MenuName, m.MenuUrl FROM magod_setup.menus m where ActiveMenu = '1'`,
                    async (data) => {
                      infoLog(`/addusermenus`);
                      res.send({ status: "success" });
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  } catch (error) {
    errorLog(`/addusermenus`, error);
    next(error);
  }
});

// New endpoint to fetch menu URLs
pnuserRouter.post("/fetchMenuUrls", jsonParser, async (req, res, next) => {
  try {
    const { role, username } = req.body;
    if (!role || !username) return res.send(createError.BadRequest());

    setupQueryMod(
      `Select usr.Name, usr.UserName,usr.Password,usr.Role, unt.UnitName,usr.ActiveUser,unt.State_Id,unt.GST_No from magod_setup.magod_userlist usr
        left join magod_setup.magodlaser_units unt on unt.UnitID = usr.UnitID WHERE usr.UserName = '${username}' and usr.ActiveUser = '1'`,
      async (err, d) => {
        if (err) errorLog("/fetchMenuUrls", err);
        let data = d;
        if (data.length > 0) {
          setupQueryMod(
            `Select m.MenuUrl,ModuleId  from magod_setup.menumapping mm
                left outer join magod_setup.menus m on m.Id = mm.MenuId
                where mm.Role = '${data[0]["Role"]}' and mm.ActiveMenu = '1'`,
            async (err, mdata) => {
              if (err) errorLog("/fetchMenuUrls", err);
              else infoLog("/fetchMenuUrls");
              let menuarray = [];
              mdata.forEach((element) => {
                menuarray.push(element["MenuUrl"]);
              });
              const moduleIds = [
                ...new Set(
                  mdata.map((menu) => menu.ModuleId).filter((id) => id !== null)
                ),
              ];
              res.send({
                data: { ...data, access: menuarray },
                moduleIds: moduleIds,
              });
            }
          );
        } else {
          let err_2 = createError.Unauthorized("Invalid Username");
          res.send(err_2);
          errorLog("/fetchMenuUrls", err_2);
        }
      }
    );
  } catch (error) {
    errorLog("/fetchMenuUrls", error);
    next(error);
  }
});

module.exports = pnuserRouter;
