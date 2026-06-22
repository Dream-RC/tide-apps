import React from "react";
import { getAccessToken } from "./common/utils/auth";

const whiteList: string[] = ["/login"];

export const checkAuth = (): boolean => {
  return !!getAccessToken();
};

const PermissionGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const path = window.location.pathname;

  // if (!getAccessToken()) {
  //   if (whiteList.includes(path)) {
  //     return <>{children}</>;
  //   }
  //   window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
  //   return null;
  // }

  // if (path === "/login") {
  //   window.location.href = "/";
  //   return null;
  // }

  return <>{children}</>;
};

export default PermissionGuard;
