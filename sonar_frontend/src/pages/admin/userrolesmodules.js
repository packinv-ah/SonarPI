import { useEffect, useState } from "react";
import { Row, Table, Form } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const { postRequest } = require("../api/apiinstance");
const { endpoints } = require("../api/constants");

// Displays and manages user roles and modules form
function UserRolesModules() {
  let [searchParams] = useSearchParams();
  let [selectedusrroledata, setSelectedUsrRoleData] = useState([]);
  let [usertype, setUserType] = useState("");
  let [rolename, setRoleName] = useState("");
  let [selrolename, setSelRoleName] = useState("");
  let [selectedRoleId, setSelectedRoleId] = useState("");
  let [btntext, setBtnText] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    async function getUsrRoledata() {
      postRequest(endpoints.getUserRoles, {}, (data) => {
        setSelectedUsrRoleData(data);
      });
    }
    getUsrRoledata();
    setBtnText("Save");
  }, []);

  // Handles selection of a role row
  let selroles = (id, selusrroles) => {
    setSelectedRoleId(id);
    setRoleName(selusrroles["Role"]);
    setSelRoleName(selusrroles["Role"]);
  };

  // Renders a user role row in the table
  let renderusrroles = (selusrroles, id) => {
    return (
      <tr
        className="custtr"
        style={{
          backgroundColor: selectedRoleId === id ? "#98A8F8" : "",
          fontFamily: "Roboto",
          fontSize: "12px",
          cursor: "pointer",
          height: "25px",
        }}
        id={id}
        onClick={() => selroles(id, selusrroles)}
      >
        <td
          className="custtd"
          style={{ fontFamily: "Roboto", fontSize: "12px" }}
        >
          {selusrroles["Role"]}
        </td>
      </tr>
    );
  };

  // Clears the role name input
  let clearData = () => {
    setRoleName("");
  };

  // Handles deleting a user role
  async function delUserRole(e) {
    e.preventDefault();
    if (rolename == "") {
      toast.error("Please select a Role to Delete ");
      return;
    }
    postRequest(endpoints.delUserRoles, { rolenm: rolename }, async (data) => {
      if (data.status === "RoleMenu") {
        toast.success("Menu is Mapped for the Role");
      } else if (data.status === "Deleted") {
        toast.success("Role Deleted Successfully");
      }
      postRequest(endpoints.getUserRoles, {}, (roldata) => {
        setSelectedUsrRoleData(roldata);
      });
    });
    setRoleName("");
  }

  // Handles submitting a new user role
  async function submitusrroles(e) {
    e.preventDefault();
    if (e.target.elements.rolename.value === " ") {
      toast.error("Please enter Role Name");
      return;
    }
    let usrrole = e.target.elements.rolename.value;
    let usrroledata = {
      Role: usrrole,
    };

    postRequest(endpoints.addUserRoles, { usrroledata }, (data) => {
      if (data.status === "success") {
        e.target.elements.rolename.value = "";
        setRoleName(e.target.elements.rolename.value);
        toast.success("Role Added successfully");
      } else {
        e.target.elements.rolename.value = "";
        setRoleName(e.target.elements.rolename.value);
        toast.error("Role Already exists");
      }
      setRoleName("");
      postRequest(endpoints.getUserRoles, {}, (data) => {
        setSelectedUsrRoleData(data);
      });
    });
  }

  return (
    <div>
      <h4 className="title">Create Roles</h4>
      <div className="form-style">
        <Form onSubmit={submitusrroles} autoComplete="off">
          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="rolename">
                <Form.Label>Role Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Role Name"
                  maxLength={30}
                  onChange={(e) => setRoleName(e.target.value)}
                  value={rolename}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4 mt-4">
              <Form.Group className="">
                <button className="button-style" type="submit" id="btnsave">
                  {" "}
                  {btntext}
                </button>
                <button className="button-style" onClick={delUserRole}>
                  Delete
                </button>
              </Form.Group>
            </div>
          </div>
          <Row className="mt-2">
            <div
              xs={7}
              className="mb-2"
              style={{ width: "450px", height: "400px", overflowY: "scroll" }}
            >
              <Table striped className="table-data border">
                <thead className="tableHeaderBGColor tablebody">
                  <tr>
                    {["Role"].map((h) => {
                      return <th>{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody className="tablebody">
                  {selectedusrroledata != null
                    ? selectedusrroledata.map((selusrroles, id) =>
                        renderusrroles(selusrroles, id)
                      )
                    : ""}
                </tbody>
              </Table>
            </div>
          </Row>
        </Form>
      </div>
    </div>
  );
}

export default UserRolesModules;
