import React from "react";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";

import "./styles/base.scss";
import { SidebarLayout } from "./components/sidebar/sidebar";
import { GamePage } from "./pages/game/game-page";
import { RegistrationPage } from "./pages/registration/registration-page";
import { LoginPage } from "./pages/login/login-page";
import { ProfilePage } from "./pages/profile/profile-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SidebarLayout />,
    children: [
      {
        index: true,
        loader: () => redirect("/game"),
      },
      {
        path: "/game",
        element: <GamePage />,
      },
      {
        path: "/register",
        element: <RegistrationPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },
]);

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
