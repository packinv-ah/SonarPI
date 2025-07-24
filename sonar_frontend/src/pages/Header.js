import { useState } from "react";
import Cookies from "js-cookie";

// Header component for displaying user info and logout
function Header() {
  // Function to get user data from cookies
  const getUser = () => {
    const cookieData = JSON.parse(Cookies.get("userData"));
    if (cookieData) {
      const data = cookieData;
      return data.data;
    }
    return null;
  };
  const userData = JSON.parse(Cookies.get("userData"));
  const versionUrl = process.env.REACT_APP_VERSION;
  const logoutUrl = process.env.REACT_APP_LOGOUT_URL;

  // Function to handle logout
  const logout = () => {
    Cookies.remove("userData");
    window.location.replace(logoutUrl);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const userDropDown = Boolean(anchorEl);

  // Handles opening the user dropdown
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handles closing the user dropdown
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <nav className="header">
        <div style={{ marginLeft: "10px" }}>
          <h4 style={{ fontSize: "16px", fontWeight: "600" }}>Magod ERP</h4>
        </div>

        <div
          style={{ marginRight: "30px", fontSize: "12px", fontWeight: "600" }}
        >
          {versionUrl} {"  "}
          {userData.Name} - {userData.UnitName} | {""}
          <button
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "black",
              fontSize: "12px",
              fontWeight: "600",
            }}
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ height: "10px" }}>&nbsp;</div>
    </>
  );
}

export default Header;
