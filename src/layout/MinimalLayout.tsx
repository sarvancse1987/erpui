import React from "react";
import { Outlet } from "react-router-dom";
import "../asset/basiclayout/_variables.scss";
import "../asset/basiclayout/index.scss";
import { Header } from "../modules/basics/Header";
import { Footer } from "../modules/basics/Footer";
import { ERPChatbot } from "../modules/Chatbot/ERPChatbot";

export default function MinimalLayout() {
  return (
    <>
      <div className="minimal-layout">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
        <Footer />

         <ERPChatbot />
      </div>
    </>
  );
}
