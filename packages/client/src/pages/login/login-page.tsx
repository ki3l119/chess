import React from "react";

import "./login-page.scss";
import { Card } from "@/components/card/card";
import { LoginForm } from "./login-form/login-form";

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-page__content">
        <h1 className="login-page__title">Login</h1>
        <Card>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
};
