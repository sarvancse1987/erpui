import React, { useContext } from "react";
import AppMenuitem from "./AppMenuitem";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";
import { AppMenuItem } from "./layoutprops";

const AppMenu: React.FC = () => {
  const { layoutConfig } = useContext(LayoutContext);

  const model: AppMenuItem[] = [
    {
      label: "Home",
      items: [
        { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" },
        { label: "Profile", icon: "pi pi-fw pi-user", to: "/Profile" },
        {
          label: "Testimonial",
          icon: "pi pi-fw pi-id-card",
          to: "/testimonial",
        },
      ],
    },
    {
      label: "Master",
      items: [
        // { label: "Products", icon: "pi pi-fw pi-id-card", to: "/products" },
        // {
        //   label: "DataTable",
        //   icon: "pi pi-fw pi-check-square",
        //   to: "/datatable",
        // },
        {
          label: "Products",
          icon: "pi pi-fw pi-user",
          items: [
            {
              label: "Categories",
              icon: "pi pi-fw pi-sign-in",
              to: "/products/category",
            },
            {
              label: "Groups",
              icon: "pi pi-fw pi-times-circle",
              to: "/products/group",
            },
            {
              label: "Brands",
              icon: "pi pi-fw pi-times-circle",
              to: "/products/brand",
            },
            {
              label: "Products",
              icon: "pi pi-fw pi-times-circle",
              to: "/products",
            },
            {
              label: "Units",
              icon: "pi pi-fw pi-times-circle",
              to: "/products/unit",
            },
          ],
        },
      ],
    },
    {
      label: "User",
      icon: "pi pi-fw pi-briefcase",
      to: "/pages",
      items: [
        {
          label: "Landing",
          icon: "pi pi-fw pi-globe",
          to: "/landing",
        },
        {
          label: "Auth",
          icon: "pi pi-fw pi-user",
          items: [
            {
              label: "Login",
              icon: "pi pi-fw pi-sign-in",
              to: "/testimonial",
            },
            {
              label: "Error",
              icon: "pi pi-fw pi-times-circle",
              to: "/Myprofile",
            },
          ],
        },
      ],
    },
    {
      label: "Company",
      icon: "pi pi-fw pi-briefcase",
      to: "/pages",
      items: [
        {
          label: "Landing",
          icon: "pi pi-fw pi-globe",
          to: "/landing",
        },
        {
          label: "Auth",
          icon: "pi pi-fw pi-user",
          items: [
            {
              label: "Login",
              icon: "pi pi-fw pi-sign-in",
              to: "/testimonial",
            },
            {
              label: "Error",
              icon: "pi pi-fw pi-times-circle",
              to: "/Myprofile",
            },
          ],
        },
        {
          label: "Crud",
          icon: "pi pi-fw pi-pencil",
          to: "/pages/crud",
        },
      ],
    },
    {
      label: "Companys",
      items: [
        {
          label: "Submenu 1",
          icon: "pi pi-fw pi-bookmark",
          items: [
            {
              label: "Submenu 1.1",
              icon: "pi pi-fw pi-bookmark",
              items: [
                { label: "Submenu 1.1.1", icon: "pi pi-fw pi-bookmark" },
                { label: "Submenu 1.1.2", icon: "pi pi-fw pi-bookmark" },
                { label: "Submenu 1.1.3", icon: "pi pi-fw pi-bookmark" },
              ],
            },
            {
              label: "Submenu 1.2",
              icon: "pi pi-fw pi-bookmark",
              items: [{ label: "Submenu 1.2.1", icon: "pi pi-fw pi-bookmark" }],
            },
          ],
        }
      ],
    },
  ];

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) =>
          !item.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator" key={`separator-${i}`}></li>
          )
        )}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
