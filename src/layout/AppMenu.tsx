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
        { label: "Client", icon: "pi pi-fw pi-home", to: "/Client" },
        { label: "Customer", icon: "pi pi-fw pi-home", to: "/customer" },
        { label: "Profile", icon: "pi pi-fw pi-user", to: "/Profile" },
        {
          label: "Testimonial",
          icon: "pi pi-fw pi-id-card",
          to: "/testimonial",
        },
      ],
    },
    {
      label: "UI Components",
      items: [
        { label: "Form Layout", icon: "pi pi-fw pi-id-card", to: "/form" },
        {
          label: "DataTable",
          icon: "pi pi-fw pi-check-square",
          to: "/datatable",
        },
      ],
    },
    {
      label: "Pages",
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
        {
          label: "Timeline",
          icon: "pi pi-fw pi-calendar",
          to: "/pages/timeline",
        },
        {
          label: "Not Found",
          icon: "pi pi-fw pi-exclamation-circle",
          to: "/pages/notfound",
        },
        {
          label: "Empty",
          icon: "pi pi-fw pi-circle-off",
          to: "/pages/empty",
        },
      ],
    },
    {
      label: "Hierarchy",
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
        },
        {
          label: "Submenu 2",
          icon: "pi pi-fw pi-bookmark",
          items: [
            {
              label: "Submenu 2.1",
              icon: "pi pi-fw pi-bookmark",
              items: [
                { label: "Submenu 2.1.1", icon: "pi pi-fw pi-bookmark" },
                { label: "Submenu 2.1.2", icon: "pi pi-fw pi-bookmark" },
              ],
            },
            {
              label: "Submenu 2.2",
              icon: "pi pi-fw pi-bookmark",
              items: [{ label: "Submenu 2.2.1", icon: "pi pi-fw pi-bookmark" }],
            },
          ],
        },
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
