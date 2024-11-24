import React from "react";

import "./login-page.scss";
import { LoginForm } from "../../components/login-form/login-form";
import { Card } from "../../components/card/card";

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
