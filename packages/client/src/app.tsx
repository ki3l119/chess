import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import "./styles/base.scss";
import { SidebarLayout } from "./components/sidebar/sidebar";
import { AuthCheck } from "./components/auth-check/auth-check";
import { GamePage } from "./pages/game/game-page";
import { RegistrationPage } from "./pages/registration/registration-page";
import { LoginPage } from "./pages/login/login-page";
import { ProfilePage } from "./pages/profile/profile-page";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SidebarLayout />}>
          <Route index element={<Navigate to="/game" />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route
            element={<AuthCheck isAuthenticated={true} redirectTo="/login" />}
          >
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<AuthCheck isAuthenticated={false} redirectTo="/" />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
