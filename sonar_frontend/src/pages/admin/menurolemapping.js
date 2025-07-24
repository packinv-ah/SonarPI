import { useEffect, useState } from "react";
import { Form, Row, Table, FormLabel } from "react-bootstrap";
import { toast } from "react-toastify";

const { postRequest } = require("../api/apiinstance");
const { endpoints } = require("../api/constants");

// Displays and manages the menu-role mapping form
function Menurolemapping() {
  let [rolesdata, setRolesData] = useState([]);
  let [menusdata, setMenusData] = useState([]);
  let [rolemenudata, setRoleMenuData] = useState([]);
  let [newselectedmenudata, setNewSelectedMenuData] = useState([]);
  let [counter, setCounter] = useState(1);

  let [role, setRole] = useState("");

  useEffect(() => {
    async function getMenuRolesData() {
      postRequest(endpoints.getUserRoles, {}, (data) => {
        setRolesData(data);
      });
      postRequest(endpoints.getUserMenus, {}, (mdldata) => {
        setMenusData(mdldata);
      });
    }
    getMenuRolesData();
  }, []);

  // Handles role selection and loads role menus
  let selectRole = (e) => {
    let selrole = e.target.value;
    setRole(selrole);
    postRequest(endpoints.getRoleMenus, { Role: selrole }, (rmdata) => {
      setRoleMenuData(rmdata);
    });
  };

  // Handles checkbox change for menu selection
  let markchecked = (e, menuname) => {
    let oldselected = rolemenudata;
    if (!e.target.checked) {
      for (let i = 0; i < oldselected.length; i++) {
        if (oldselected[i]["MenuName"] == menuname) {
          oldselected.splice(i, 1);
          break;
        }
      }
      setRoleMenuData([...oldselected]);
    } else {
      setRoleMenuData([...rolemenudata, { role: role, MenuName: menuname }]);
    }
    setCounter(counter + 1);
  };

  // Checks if a menu is selected for the current role
  let checkselected = (menuname) => {
    for (let j = 0; j < rolemenudata.length; j++) {
      if (rolemenudata[j]["MenuName"] == menuname) {
        return true;
      }
    }
    return false;
  };

  // Handles saving menu-role mappings
  let savemenuroles = (e) => {
    e.preventDefault();
    if (rolemenudata.length > 0) {
      postRequest(
        endpoints.saveMenuRoleMapping,
        { newselectedmenu: rolemenudata },
        async (data) => {
          if (data.status === "updated") {
            toast.success("Updated Successfully");
          }
          if (data.status === "") {
            toast.success("Menus Mapped Successfully");
          }
          if (data.status === "No Menu Selected") {
            toast.error("Please Select Menus for Role Access");
          }
        }
      );
    } else {
      toast.error("Please Select Menus for Role Access");
      return;
    }
    setRole("");
  };

  return (
    <div>
      <div>
        <h4 className="title ">Menu Role Mapping</h4>
        <div className="form-style">
          <Form onSubmit={savemenuroles} autoComplete="off">
            <div className="row mt-2">
              <div className="col-md-4 mb-3">
                <Form.Group className="mt-1">
                  <FormLabel>Role</FormLabel>
                  {rolesdata.length > 0 ? (
                    <select
                      className="ip-select"
                      id="role"
                      onChange={selectRole}
                      required
                    >
                      <option value="" disabled selected>
                        Select Role
                      </option>
                      {rolesdata.map((rles) => {
                        return (
                          <option
                            style={{ fontFamily: "Roboto", fontSize: "12px" }}
                            value={rles["Role"]}
                          >
                            {rles["Role"]}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    ""
                  )}
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group className="mt-1" style={{ display: "flex" }}>
                  <button className="button-style" type="submit">
                    Save
                  </button>
                </Form.Group>
              </div>
            </div>
            <Row className="mb-1">
              <div style={{ overflowY: "scroll", maxHeight: "390px" }}>
                <Table striped className="table-data border">
                  <thead className="tableHeaderBGColor tablebody">
                    <tr>
                      {["Select", "MenuName", "Details"].map((h) => {
                        return <th>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody className="tablebody">
                    {menusdata &&
                      !!counter &&
                      menusdata.map((selmenus, id) => {
                        return (
                          <tr
                            style={{
                              cursor: "pointer",
                            }}
                            id={id}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={checkselected(selmenus["MenuName"])}
                                onChange={(e) =>
                                  markchecked(e, selmenus["MenuName"])
                                }
                              />
                            </td>
                            <td>{selmenus["MenuName"]}</td>
                            <td>{selmenus["MenuUrl"]}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
              </div>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Menurolemapping;
