// src/roles/CheckAdminStatus.jsx
import React from "react";
import { useRole } from "./RoleContext";

const CheckAdminStatus = () => {
  const { role, isAdmin, loading } = useRole();

  if (loading) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Checking role...
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg bg-black/80 text-white text-xs shadow-lg">
      <div>Role: <span className="font-semibold">{role}</span></div>
      <div>
        Admin:{" "}
        <span className={isAdmin ? "text-green-400" : "text-red-400"}>
          {isAdmin ? "YES" : "NO"}
        </span>
      </div>
    </div>
  );
};

export default CheckAdminStatus;