import React from "react";

import "./registration-page.scss";
import { Card } from "@/components/card/card";
import { RegistrationForm } from "./registration-form/registration-form";

export const RegistrationPage: React.FC = () => {
  return (
    <div className="registration-page">
      <h1 className="registration-page__title">Register</h1>
      <div className="registration-page__content">
        <Card>
          <RegistrationForm />
        </Card>
      </div>
    </div>
  );
};
