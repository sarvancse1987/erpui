import React from "react";
import { Outlet } from "react-router-dom";
import "../asset/basiclayout/_variables.scss";
import "../asset/basiclayout/index.scss";
import { Header } from "../modules/basics/Header";
import { Footer } from "../modules/basics/Footer";

export default function MinimalLayout() {
  return (
    <>
      <Header />
      <main className="app-content">
        <Outlet />   {/* Home / About / Services */}
      </main>
      <Footer />
    </>
  );
}
