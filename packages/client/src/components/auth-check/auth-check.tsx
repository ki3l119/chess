import React, { useContext } from "react";

import { UserContext } from "@/contexts";
import { Navigate, Outlet } from "react-router";

export type AuthCheckProps = {
  isAuthenticated: boolean;
  redirectTo: string;
};

/**
 * Renders the child routes if the authentication status is met; otherwise,
 * performs a redirect to the specified route.
 */
export const AuthCheck: React.FC<AuthCheckProps> = ({
  isAuthenticated,
  redirectTo,
}) => {
  const { user } = useContext(UserContext);

  return (
    <>
      {(user && isAuthenticated) || (!user && !isAuthenticated) ? (
        <Outlet />
      ) : (
        <Navigate to={redirectTo} />
      )}
    </>
  );
};
