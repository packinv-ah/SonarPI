import { FaLock, FaUserAlt, FaUserCheck } from "react-icons/fa";

const SidebarUserData = [
  {
    id: 1,
    path: "/users",
    name: "Users",
    icon: <FaUserAlt />,
    subRoutes: [
      {
        name: "Roles",
        path: "/admin/userrolesmodules",
        icon: <FaUserCheck />,
      },
      {
        name: "Users",
        path: "/admin/createusers",
        icon: <FaUserAlt />,
      },
    ],
  },
  {
    id: 2,
    path: "/admin",
    name: "menurolemapping",
    icon: <FaLock />,
  },
];
export default SidebarUserData;
