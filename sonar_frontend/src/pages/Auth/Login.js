import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { apipoints } from "../api/Access/login";
import "./Login.css";

// Displays and manages the login form and authentication logic
function Login() {
  const nav = useNavigate();
  const userData = JSON.parse(Cookies.get("userData") || "{}");
  localStorage.setItem("userData", JSON.stringify(userData));
  useEffect(() => {
    if (userData) {
      const fetchMenuUrls = async () => {
        try {
          const role = userData.Role;
          const username = userData.UserName;
          if (!role || !username) {
            console.error(
              "Role, username, or access token is missing in local storage"
            );
            return;
          }
          axios
            .post(apipoints.fetchMenuUrls, {
              role,
              username,
            })
            .then((response) => {
              const responseData = response.data;
              localStorage.setItem("LazerUser", JSON.stringify(responseData));
            });
        } catch (error) {
          console.error("Error fetching menu URLs:", error);
        }
      };

      fetchMenuUrls();
      nav("PackingAndInvoices/");
    }
  }, [userData, nav]);

  return <></>;
}

export default Login;
