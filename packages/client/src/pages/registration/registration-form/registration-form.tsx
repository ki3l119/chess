import React from "react";
import { useForm } from "react-hook-form";

import { CreateUserDto } from "chess-shared-types";
import "./registration-form.scss";
import { config } from "@/config";
import { userService } from "@/services";
import { useFormSubmitHandler } from "@/hooks/form-submit-handler";
import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { Alert } from "@/components/alert/alert";

export const RegistrationForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
    reset,
  } = useForm<CreateUserDto>();
  const { submitHandler } = useFormSubmitHandler<CreateUserDto>({
    onSubmit: async (data) => {
      await userService.register(data);
      reset();
    },
    setError,
  });

  const isInputsDisabled = isSubmitting || config.disableRegistration;

  return (
    <form className="registration-form" onSubmit={handleSubmit(submitHandler)}>
      {isSubmitSuccessful && (
        <Alert type="success" message="Successfully created user account." />
      )}
      {errors.root?.serverError?.message && (
        <Alert type="error" message={errors.root.serverError.message} />
      )}
      {config.disableRegistration && (
        <Alert
          type="warning"
          message="User registration is disabled for this demo."
        />
      )}
      <Input
        type="text"
        label="Username"
        {...register("username", {
          required: "Please enter a username.",
          maxLength: {
            value: 50,
            message: "Cannot exceed 50 characters.",
          },
        })}
        error={errors.username && errors.username.message}
        disabled={isInputsDisabled}
      />
      <Input
        type="email"
        label="Email"
        {...register("email", {
          required: "Please enter your email.",
          maxLength: {
            value: 320,
            message: "Cannot exceed 320 characters.",
          },
        })}
        error={errors.email && errors.email.message}
        disabled={isInputsDisabled}
      />
      <Input
        type="password"
        label="Password"
        {...register("password", {
          required: "Please enter a password.",
          maxLength: {
            value: 128,
            message: "Cannot exceed 128 characters.",
          },
          minLength: {
            value: 8,
            message: "Must be at least 8 characters.",
          },
        })}
        error={errors.password && errors.password.message}
        disabled={isInputsDisabled}
      />
      <Button type="submit" disabled={isInputsDisabled}>
        Register
      </Button>
    </form>
  );
};
