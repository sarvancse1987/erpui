import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { LoaderContext } from "./Components/LoaderContext";
import { setLoaderHandler } from "./services/http";
import AppRouter from "./routes/AppRouter";

export default function App() {
  const { setLoading } = useContext(LoaderContext);

  useEffect(() => {
    setLoaderHandler(setLoading); // connect loader globally
  }, [setLoading]);
  
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}
