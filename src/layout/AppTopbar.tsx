/* eslint-disable react/no-unknown-property */
import { Link, useNavigate } from "react-router-dom";
import { classNames } from "primereact/utils";
import React, {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
} from "react";
import { LayoutContext } from "./context/layoutcontext";
import { OverlayPanel } from "primereact/overlaypanel";
import { useAuth } from "../auth/AuthProvider";
import { Badge } from "primereact/badge";
import appLogo from "../Images/jobsnap_logo.png";
import { AppTopbarRef } from "./layoutprops";
import { Menu } from "primereact/menu";
import { Avatar } from "primereact/avatar";

const AppTopbar = forwardRef<AppTopbarRef>((_props, ref) => {
  const { layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);

  const menubuttonRef = useRef<HTMLButtonElement>(null);
  const topbarmenubuttonRef = useRef<HTMLButtonElement>(null);
  const topbarmenuRef = useRef<HTMLDivElement>(null);
  const profileOverlayRef = useRef<OverlayPanel>(null);
  const navigate = useNavigate();
  const { token, setToken } = useAuth();

  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current,
  }));

  const onLogout = () => {
    setToken("");
    navigate("/login");
    profileOverlayRef.current?.hide();
  };

  const onMyProfile = () => {
    navigate("/Myprofile");
    profileOverlayRef.current?.hide();
  };

  return (
    <div className="layout-topbar">
      <div className="layout-topbar-logo">
        <img
          src={appLogo}
          alt="logo"
        />
      </div>

      <button
        ref={menubuttonRef}
        type="button"
        className="p-link layout-menu-button layout-topbar-button"
        onClick={onMenuToggle}
      >
        <i className="pi pi-bars"></i>
      </button>

      <button
        ref={topbarmenubuttonRef}
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={showProfileSidebar}
      >
        <i className="pi pi-ellipsis-v" />
      </button>
      <div className="">
        <strong className="layout-company-name">Tetrosoft</strong>
      </div>

      <div
        ref={topbarmenuRef}
        className={classNames("layout-topbar-menu", {
          "layout-topbar-menu-mobile-active": layoutState.profileSidebarVisible,
        })}
      >
        {/* Bell icon */}
        <button type="button" className="p-link layout-topbar-button">
          <i className="pi pi-bell p-overlay-badge">
            <Badge value="2"></Badge>
          </i>
        </button>

        {/* Profile pill */}
        <div className="profile-wrapper">
          <div
            className="profile"
            onClick={(e) => profileOverlayRef.current?.toggle(e)}
          >
            <div className="avatar-circle">
              <i className="pi pi-user"></i>
            </div>

            <span className="profile-name">
              {localStorage.getItem("userProfileName")}
            </span>
          </div>
        </div>


        {/* Overlay Panel */}
        <OverlayPanel
          ref={profileOverlayRef}
          dismissable
          style={{ width: "220px" }}
          className="custom-overlaypanel"
        >
          <button
            type="button"
            className="p-link p-button-text"
            onClick={onMyProfile}
            style={{ width: "100%", textAlign: "left", padding: "0.5rem 1rem" }}
          >
            <i className="pi pi-user" style={{ marginRight: "0.5rem" }}></i>
            My Profile
          </button>

          <button
            type="button"
            className="p-link p-button-text"
            onClick={onLogout}
            style={{ width: "100%", textAlign: "left", padding: "0.5rem 1rem" }}
          >
            <i className="pi pi-sign-out" style={{ marginRight: "0.5rem" }}></i>
            Logout
          </button>
        </OverlayPanel>
      </div>

    </div>
  );
});

AppTopbar.displayName = "AppTopbar";

export default AppTopbar;
