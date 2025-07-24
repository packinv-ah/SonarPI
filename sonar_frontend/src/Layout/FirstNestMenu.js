import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import NestMenu from "./NestMenu";

// Displays the first nested menu in the sidebar navigation
function FirstNestMenu({ subNav1, subnav }) {
  const SidebarLink = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    list-style: none;
    height: 35px;
    text-decoration: none;
    font-size: 13px;

    &:hover {
      background: #707075;
      border-left: 4px solid #707075;
      cursor: pointer;
      color: #ffffff;
    }
  `;

  const SidebarLabel = styled.span`
    margin-left: 8px;
  `;

  const DropdownLink = styled.div`
    height: 35px;
    display: flex;
    align-items: center;
    text-decoration: none;
    font-size: 13px;
    &:hover {
      background-color: #5956f3;
      cursor: pointer;
      color: #ffffff;
    }
  `;

  const IconNav = styled.div`
    padding-left: 5px;
    font-size: 1.2rem;
  `;

  const [nest, setNest] = useState(false);

  // Toggles the display of nested submenu
  const showSubnav1 = () => setNest(!nest);

  return (
    <>
      <NavLink
        to={subNav1.path}
        className={({ isActive }) =>
          isActive && subNav1.path && subnav
            ? "active-link-url  side-nav-sub-menu"
            : "link-default side-nav-sub-menu"
        }
      >
        <DropdownLink
          onClick={() => {
            subNav1.subNav && showSubnav1();
          }}
        >
          <div className="sub-menu-icon"> {subNav1.icon}</div>
          <SidebarLabel className="sub-menu-label">
            {subNav1.title}
          </SidebarLabel>
        </DropdownLink>
      </NavLink>
      {nest &&
        subNav1.subNav !== undefined &&
        subNav1?.subNav.length > 0 &&
        subNav1.subNav.map((nestnav, i) => {
          return <NestMenu key={i} nestnav={nestnav} />;
        })}
    </>
  );
}

export default FirstNestMenu;
