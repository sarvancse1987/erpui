import React from "react";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ title, children }) => {
  return (
    <div className="flex justify-content-center">
      <div className="w-full md:w-8 lg:w-6 p-4">
        <h1 className="text-center mb-4">{title}</h1>
        <div className="surface-card p-4 border-round shadow-1">
          {children}
        </div>
      </div>
    </div>
  );
};
