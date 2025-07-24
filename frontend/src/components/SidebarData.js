import * as AiIcons from "react-icons/ai";
import * as RiIcons from "react-icons/ri";
import * as FaIcon from "react-icons/fa";
import * as MdIcon from "react-icons/md";
import { VscTypeHierarchySub } from "react-icons/vsc";
import { BiFoodMenu } from "react-icons/bi";
import { AiOutlineDeploymentUnit } from "react-icons/ai";
import { HiUsers } from "react-icons/hi";
import { TbPackage } from "react-icons/tb";
import { TbFileInvoice } from "react-icons/tb";
import { MdBackupTable } from "react-icons/md";
import { RiFileInfoLine } from "react-icons/ri";
import { VscGitPullRequestCreate } from "react-icons/vsc";
import { BsReverseLayoutTextWindowReverse } from "react-icons/bs";
import { MdMiscellaneousServices } from "react-icons/md";
import { SiEquinixmetal } from "react-icons/si";
import { FiSliders } from "react-icons/fi";
import { FaRegDotCircle } from "react-icons/fa";

const previousMenuUrl = process.env.REACT_APP_PREVIOUS_MENU_URL;

export const customerSidebar = [
  {
    title: "Inspection",
    icon: <RiFileInfoLine />,
    subNav: [
      {
        title: "Profile",
        icon: <AiOutlineDeploymentUnit />,
        subNav: [
          {
            title: "ScheduleList",
            path: "/PackingAndInvoices/Inspection/Profile/ScheduleList",
            icon: <AiIcons.AiOutlineArrowRight />,
          },
          {
            title: "FindSchedule",
            path: "/PackingAndInvoices/Inspection/Profile/FindSchedule",
            icon: <AiIcons.AiOutlineArrowRight />,
          },
        ],
      },
      {
        title: "Fabrication",
        icon: <MdMiscellaneousServices />,
        subNav: [
          {
            title: "ScheduleList",
            path: "/PackingAndInvoices/Inspection/Fabrication/ScheduleList",
            icon: <AiIcons.AiOutlineArrowRight />,
          },
          {
            title: "FindSchedule",
            path: "/PackingAndInvoices/Inspection/Fabrication/FindSchedule",
            icon: <AiIcons.AiOutlineArrowRight />,
          },
        ],
      },
      {
        title: "Services",
        icon: <FiSliders />,
        subNav: [
          {
            title: "ScheduleList",
            path: "/PackingAndInvoices/Inspection/Services/ScheduleList",
            icon: <AiIcons.AiOutlineArrowRight />,
          },
          {
            title: "FindSchedule",
            path: "/PackingAndInvoices/Inspection/services/FindSchedule",
            icon: <AiIcons.AiOutlineArrowRight />,
          },
        ],
      },
    ],
  },
  {
    title: "Packing Note",
    icon: <TbPackage />,
    subNav: [
      {
        title: "Fabrication",
        icon: <AiOutlineDeploymentUnit />,
        path: "/PackingAndInvoices/PackingNote/FabricationOpenForm",
      },
      {
        title: "Services",
        icon: <MdMiscellaneousServices />,
        path: "/PackingAndInvoices/PackingNote/ServicesOpenForm",
      },
      {
        title: "Profile",
        icon: <FiSliders />,
        path: "/PackingAndInvoices/PackingNote/ProfileOpenForm",
      },
      {
        title: "Misc",
        icon: <SiEquinixmetal />,
        path: "/PackingAndInvoices/PackingNote/MiscOpenForm",
      },
    ],
  },
  {
    title: "Invoice",
    icon: <TbFileInvoice />,
    subNav: [
      {
        title: "Misc Invoice ",
        icon: <TbFileInvoice />,
        subNav: [
          {
            title: "Create New",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/Invoice/MiscInvoice/CreateNew",
          },
          {
            title: "PN List",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/Invoice/MiscInvoice/PNList",
          },
          {
            title: "Invoice List",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/Invoice/MiscInvoice/InvoiceList",
          },
        ],
      },
      {
        title: "Material Scrap Invoice",
        icon: <TbFileInvoice />,
        subNav: [
          {
            title: "Scrap",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/Invoice/MaterialScrapInvoice/Scrap",
          },
          {
            title: "Material Return",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/Invoice/MaterialScrapInvoice/MaterialReturn",
          },
          {
            title: "PN List",
            icon: <AiIcons.AiOutlineArrowRight />,
            subNav: [
              {
                title: "Scrap",
                icon: <FaRegDotCircle />,
                path: "/PackingAndInvoices/Invoice/MaterialScrapInvoice/PNList/Scrap",
              },
              {
                title: "Material",
                icon: <FaRegDotCircle />,
                path: "/PackingAndInvoices/Invoice/MaterialScrapInvoice/PNList/Material",
              },
            ],
          },
          {
            title: "Invoice List",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/Invoice/MaterialScrapInvoice/InvoiceList",
          },
          {
            title: "Create New",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/Invoice/MaterialScrapInvoice/CreateNew",
          },
        ],
      },
      {
        title: "Services Invoice",
        icon: <TbFileInvoice />,
        path: "/PackingAndInvoices/Invoice/ServicesInvoice",
      },
      {
        title: "Sales Invoice",
        icon: <TbFileInvoice />,
        path: "/PackingAndInvoices/Invoice/SalesInvoice",
      },
      {
        title: "Fabrication Invoice",
        icon: <TbFileInvoice />,
        path: "/PackingAndInvoices/Invoice/FabricationInvoice",
      },
    ],
  },
  {
    title: "ReturnableDC",
    icon: <MdBackupTable />,
    subNav: [
      {
        title: "Create New",
        icon: <VscGitPullRequestCreate />,
        path: "/PackingAndInvoices/ReturnableDC/DCCreateNew",
      },
      {
        title: "DC List",
        icon: <BsReverseLayoutTextWindowReverse />,
        subNav: [
          {
            title: "Created",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/ReturnableDC/DCList/DCListCreated",
          },
          {
            title: "Dispatched",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/ReturnableDC/DCList/DCListDispatched",
          },
          {
            title: "Closed",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/ReturnableDC/DCList/DCListClosed",
          },
          {
            title: "All",
            icon: <AiIcons.AiOutlineArrowRight />,
            path: "/PackingAndInvoices/ReturnableDC/DCList/DCListAll",
          },
        ],
      },
    ],
  },
  {
    title: "Previous Menu",
    path: previousMenuUrl,
    icon: <MdIcon.MdPreview />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,
  },
];
export const adminSidebar = [
  {
    title: "Access",
    icon: <MdIcon.MdOutlineSecurity />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,
    subNav: [
      {
        title: "Menu Roles",
        path: "/admin/menuRoles",
        icon: <AiIcons.AiOutlineMenuFold />,
      },
    ],
  },
  {
    title: "Users",
    icon: <FaIcon.FaUsers />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,
    subNav: [
      {
        title: "Roles",
        path: "/admin/roles",
        icon: <VscTypeHierarchySub />,
      },
      {
        title: "Menus",
        path: "/admin/menus",
        icon: <BiFoodMenu />,
      },
      {
        title: "Users",
        path: "/admin/users",
        icon: <HiUsers />,
      },
    ],
  },
];
