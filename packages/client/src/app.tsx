import React from "react";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";

import "./styles/base.scss";
import { HomePage } from "./pages/home/home-page";

const router = createBrowserRouter([
  {
    path: "/",
    loader: () => redirect("/game"),
  },
  {
    path: "/game",
    element: <HomePage />,
  },
]);

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
