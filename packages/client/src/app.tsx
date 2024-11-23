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
    ],
  },
]);

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
