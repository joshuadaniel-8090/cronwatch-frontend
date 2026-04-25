// src/components/shared/LoadingSpinner.tsx
import React from "react";

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="relative w-10 h-10">
        <div className="absolute w-full h-full border-4 border-purple-500/20 rounded-full" />
        <div className="absolute w-full h-full border-4 border-purple-600 rounded-full border-t-transparent animate-spin" />
      </div>
    </div>
  );
};
