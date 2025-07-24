import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useLocation } from "react-router-dom";

// BreadcrumbsComponent displays the navigation path as breadcrumbs
const BreadcrumbsComponent = () => {
  const location = useLocation(); // Gets the current location object
  const pathnames = location.pathname.split("/").filter((x) => x); // Splits the pathname into segments

  return (
    <div style={{ marginLeft: "10px" }}>
      <Breadcrumbs aria-label="breadcrumb" separator="›">
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          return last ? (
            <Typography key={index} style={{ fontSize: "14px" }}>
              {value}
            </Typography>
          ) : (
            <Link
              to={to}
              key={index}
              style={{ textDecoration: "none", fontSize: "14px" }}
            >
              {" "}
              {value}
            </Link>
          );
        })}
      </Breadcrumbs>
    </div>
  );
};

export default BreadcrumbsComponent;
