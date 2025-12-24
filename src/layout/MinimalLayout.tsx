import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../modules/basics/Header";
import Footer from "../modules/basics/Footer";
import "../asset/basiclayout/_variables.scss";
import "../asset/basiclayout/index.scss";

export default function MinimalLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* <Header /> */}
      <Outlet />
      {/* <Footer /> */}
    </div>
  );
}
