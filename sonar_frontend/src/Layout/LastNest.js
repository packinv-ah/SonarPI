import { NavLink } from "react-router-dom";

// Displays the last nested menu item
const LastNest = ({ lastNest }) => {
  return (
    <>
      <NavLink
        className={({ isActive }) =>
          isActive && lastNest.path ? "active-link-url" : "link-default"
        }
        to={lastNest.path}
      >
        <li className="submenu_link">
          <div className="submenu_links" style={{ paddingLeft: "35px" }}>
            <div className="icon" style={{ color: "white" }}>
              {lastNest.icon}
            </div>
            <div className="link_text">{lastNest.title}</div>
          </div>
        </li>
      </NavLink>
    </>
  );
};

export default LastNest;
