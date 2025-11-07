// GlobalLoader.tsx
import React, { useContext } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { LoaderContext } from "./LoaderContext";

const GlobalLoader: React.FC = () => {
  const { loading } = useContext(LoaderContext);

  return loading ? (
    <div className="global-loader-overlay">
      <ProgressSpinner />
      <div className="loader-text">Loading...</div>
    </div>
  ) : null;
};

export default GlobalLoader;
