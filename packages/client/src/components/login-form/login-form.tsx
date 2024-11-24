import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import "./login-form.scss";
import { LoginDto } from "chess-shared-types";
import { Input } from "../input/input";
import { Button } from "../button/button";
import { userService } from "../../services";
import { Alert } from "../alert/alert";
import { useFormSubmitHandler } from "../../hooks/form-submit-handler";

export const LoginForm: React.FC = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<LoginDto>();
  const navigate = useNavigate();
  const { submitHandler } = useFormSubmitHandler<LoginDto>({
    onSubmit: async (data) => {
      await userService.login(data);
      reset();
      navigate("/game");
    },
    setError,
  });

  return (
    <form className="login-form" onSubmit={handleSubmit(submitHandler)}>
      {errors.root?.serverError?.message && (
        <Alert type="error" message={errors.root.serverError.message} />
      )}
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
        disabled={isSubmitting}
        error={errors.email?.message}
      />
      <Input
        type="password"
        label="Password"
        {...register("password", {
          required: "Please enter your password.",
          maxLength: {
            value: 128,
            message: "Cannot exceed 128 characters.",
          },
        })}
        error={errors.password?.message}
      />
      <Button type="submit">Login</Button>
    </form>
  );
};
