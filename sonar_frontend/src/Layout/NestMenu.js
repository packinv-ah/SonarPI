import { useState } from "react";
import { NavLink } from "react-router-dom";
import LastNest from "./LastNest";

// Displays the nested menu in the sidebar navigation
const NestMenu = ({ nestnav }) => {
  const [nest, setNest] = useState(false);
  const showSubnav1 = () => setNest(!nest);

  const just = "centre";

  return (
    <>
      <NavLink className={({ isActive }) => "link-default"} to={nestnav.path}>
        <li
          className="submenu_link"
          onClick={() => {
            nestnav.subNav && showSubnav1();
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="submenu_links" style={{ marginLeft: "15%" }}>
            <div className="icon" style={{ color: "white" }}>
              {nestnav.icon}
            </div>
            <div className="link_text">{nestnav.title}</div>
          </div>
        </li>
      </NavLink>
      {nest &&
        nestnav.subNav !== undefined &&
        nestnav?.subNav.length > 0 &&
        nestnav.subNav.map((lastNest, i) => {
          return <LastNest key={i} lastNest={lastNest} />;
        })}
    </>
  );
};

export default NestMenu;
