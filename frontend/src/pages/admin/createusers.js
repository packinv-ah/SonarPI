import React, { useEffect, useState } from "react";
import { Row, Table, Form } from "react-bootstrap";
import { toast } from "react-toastify";

const { postRequest } = require("../api/apiinstance");
const { endpoints } = require("../api/constants");

// Displays and manages the user creation and management form
function CreateUsers() {
  let [selecteduserrowdata, setSelectedUserRowData] = useState([]);
  let [userrolesdata, setUserRolesData] = useState([]);
  let [unitsdata, setUnitsData] = useState([]);
  let [selectedUserId, setSelectedUserId] = useState("");
  let [selectedusermenudata, setSelectedUserMenuData] = useState([]);

  let [uname, setUname] = useState("");
  let [username, setUsername] = useState("");
  let [urole, setUrole] = useState("");
  let [password, setPassword] = useState("");
  let [passreset, setPassReset] = useState(false);
  let [unit, setUnit] = useState("");
  let [btnsave, setBtnSave] = useState(false);
  let [btndelete, setBtnDelete] = useState(true);

  useEffect(() => {
    setBtnSave(false);
    async function getUsersdata() {
      postRequest(endpoints.getUsers, {}, (data) => {
        setSelectedUserRowData(data);
      });
      postRequest(endpoints.getUserRoles, {}, (data) => {
        setUserRolesData(data);
      });
      postRequest(endpoints.getUnits, {}, (untdata) => {
        setUnitsData(untdata);
      });
    }
    getUsersdata();
  }, []);

  // Handles user row selection and loads user details
  let selecteduserdata = (id, selusrs) => {
    setBtnSave(true);
    setBtnDelete(false);
    setUname(selusrs["Name"]);
    setUsername(selusrs["UserName"]);
    setPassReset(selusrs["PassReset"] == true ? true : false);
    setUrole(selusrs["Role"]);
    setUnit(selusrs["Unit"]);

    postRequest(endpoints.getRoleMenus, { Role: selusrs["Role"] }, (data) => {
      setSelectedUserMenuData(data);
    });
  };

  // Renders a user row in the users table
  let renderusers = (selusrs, id) => {
    return (
      <tr
        style={{
          backgroundColor: selectedUserId === id ? "#98A8F8" : "",
          cursor: "pointer",
        }}
        id={id}
        onClick={() => {
          selecteduserdata(id, selusrs);
        }}
      >
        <td>{selusrs["Name"]}</td>
        <td>{selusrs["UserName"]}</td>
        <td>{selusrs["Role"]}</td>
        <td>{selusrs["UnitName"]}</td>
      </tr>
    );
  };

  // Renders a menu permission row for the selected user
  let renderusermenu = (selusrmnus) => {
    return (
      <tr
        style={{
          backgroundColor: "#98A8F8",
          cursor: "pointer",
        }}
      >
        <td>{selusrmnus["MenuName"]}</td>
      </tr>
    );
  };

  // Handles saving a new or updated user
  let saveusers = (e) => {
    e.preventDefault();
    setBtnSave(false);
    setBtnDelete(true);
    if (
      e.target.elements.uname.value == "" ||
      e.target.elements.username.value == "" ||
      e.target.elements.password.value == "" ||
      e.target.elements.unit.value == ""
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    if (
      e.target.elements.urole.value == "" ||
      e.target.elements.urole.value == "Select Role"
    ) {
      toast.error("Please select a role");
      return;
    }
    let usrname = e.target.elements.uname.value;
    let usrusername = e.target.elements.username.value;
    let usrpassword = e.target.elements.password.value;
    let usrrole = e.target.elements.urole.value;
    let usrunit = e.target.elements.unit.value;
    let usrdata = {
      Name: usrname,
      UserName: usrusername,
      Password: usrpassword,
      Role: usrrole,
      Unit: usrunit,
    };
    postRequest(endpoints.saveUsers, { usrdata }, (data) => {
      setSelectedUserRowData(data.d);
      if (data.status == "success") {
        toast.success("User Created successfully..");
      } else {
        toast.error("User Already Exists..");
      }
      postRequest(endpoints.getUsers, {}, (data) => {
        setSelectedUserRowData(data);
      });
    });
    cleardata();
  };

  // Clears the user form fields
  let cleardata = () => {
    setUname("");
    setUsername("");
    setPassword("");
    setPassReset(false);
    setUrole("");
    setUnit("");
  };

  // Handles alphanumeric input for user name
  const handleChangeAlphaNumeric = (e) => {
    const mvalue = e.target.value.replace(/[^A-Za-z0-9 ]/gi, "");
    if (mvalue.includes("  ")) {
      toast.error("Cannot enter spaces for User Name");
      return;
    }
    setUname(mvalue);
  };

  // Handles password input and prevents spaces
  const passchk = (e) => {
    const passvalue = e.target.value;
    if (passvalue.includes(" ")) {
      toast.error("Cannot given only spaces for Password");
      return;
    }
    setPassword(passvalue);
  };

  // Handles user deactivation
  async function deactiveuser(e) {
    e.preventDefault();
    setBtnSave(false);
    setBtnDelete(true);
    postRequest(endpoints.delUsers, { uname: username }, async (data) => {
      if (data.status === "Deleted") {
        toast.success("Deleted User Successfully");
      }
    });
    cleardata();
    postRequest(endpoints.getUsers, {}, (data) => {
      setSelectedUserRowData(data);
    });
  }

  return (
    <div>
      <div>
        <h4 className="title">Create Users</h4>
        <div className="form-style">
          <Form onSubmit={saveusers} autoComplete="off">
            <div className="row">
              <div className="col-md-3">
                <Form.Group as={Row} className="mt-1" controlId="uname">
                  <label className="form-label">Name</label>
                  <Form.Control
                    placeholder="Enter Name"
                    onChange={handleChangeAlphaNumeric}
                    value={uname}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group as={Row} className="mt-1" controlId="username">
                  <label className="form-label">User Name</label>
                  <Form.Control
                    type="text"
                    placeholder="Enter User Name"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group as={Row} className="mt-1" controlId="password">
                  <label className="form-label">Password</label>
                  <Form.Control
                    type="password"
                    placeholder="Enter Password"
                    onChange={passchk}
                    value={password}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-md-3">
                {" "}
                <Form.Group as={Row} className="mt-1">
                  <label className="form-label">Role</label>
                  {userrolesdata.length > 0 ? (
                    <select
                      className="ip-select"
                      id="urole"
                      onChange={(e) => setUrole(e.target.value)}
                      value={urole}
                      required
                    >
                      <option value="" disabled selected>
                        {" "}
                        Select Role{" "}
                      </option>
                      {userrolesdata.map((usrrole) => {
                        return (
                          <option value={usrrole["Role"]}>
                            {usrrole["Role"]}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    ""
                  )}
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group
                  as={Row}
                  className="mt-1"
                  style={{ display: "flex" }}
                >
                  <label className="form-label">Unit</label>
                  {unitsdata.length > 0 ? (
                    <select
                      className="ip-select"
                      id="unit"
                      onChange={(e) => setUnit(e.target.value)}
                      value={unit}
                      required
                    >
                      {" "}
                      <option value="" disabled selected>
                        {" "}
                        Select Unit{" "}
                      </option>
                      {unitsdata.map((unit, id) => {
                        return (
                          <option key={id} value={unit["UnitID"]}>
                            {unit["UnitName"]}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    ""
                  )}
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mt-1" controlId="submit">
                  <button
                    className="button-style"
                    disabled={btnsave}
                    type="submit"
                  >
                    Save
                  </button>
                  <button
                    className="button-style"
                    disabled={btndelete}
                    onClick={deactiveuser}
                  >
                    Delete
                  </button>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-8 mt-4">
                <div style={{ maxHeight: "280px", overflowY: "scroll" }}>
                  <Table striped className="table-data border">
                    <thead className="tableHeaderBGColor tablebody">
                      <tr>
                        {["Name", "UserName", "Role", "Unit"].map((h) => {
                          return <th>{h}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody className="tablebody">
                      {selecteduserrowdata != null
                        ? selecteduserrowdata.map((selusrs, id) =>
                            renderusers(selusrs, id)
                          )
                        : ""}
                    </tbody>
                  </Table>
                </div>
              </div>
              <div className="col-md-4 mt-4">
                <div style={{ maxHeight: "300px", overflowY: "scroll" }}>
                  <Table striped className="table-data border">
                    <thead className="tableHeaderBGColor">
                      <tr>
                        {["Menu Permissions"].map((h) => {
                          return <th className="custth ">{h}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody className="tablebody">
                      {selectedusermenudata != null
                        ? selectedusermenudata.map((selusrmnus) =>
                            renderusermenu(selusrmnus)
                          )
                        : ""}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default CreateUsers;
