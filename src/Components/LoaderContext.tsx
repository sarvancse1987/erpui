import React, { createContext, useState, ReactNode } from "react";

export const LoaderContext = createContext<{
  loading: boolean;
  setLoading: (value: boolean) => void;
}>({
  loading: false,
  setLoading: () => {},
});

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};
