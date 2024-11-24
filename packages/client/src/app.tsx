import React from "react";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";

import "./styles/base.scss";
import { SidebarLayout } from "./components/sidebar/sidebar";
import { HomePage } from "./pages/home/home-page";
import { RegistrationPage } from "./pages/registration/registration-page";
import { LoginPage } from "./pages/login/login-page";

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
        element: <HomePage />,
      },
      {
        path: "/register",
        element: <RegistrationPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
]);

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
