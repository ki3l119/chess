import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import "./login-form.scss";
import { LoginDto } from "chess-shared-types";
import { UserContext } from "@/contexts";
import { Input } from "@/components/input/input";
import { Button } from "@/components/button/button";
import { userService } from "@/services";
import { Alert } from "@/components/alert/alert";
import { useFormSubmitHandler } from "@/hooks/form-submit-handler";

export const LoginForm: React.FC = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<LoginDto>();
  const navigate = useNavigate();
  const { onSuccessfulLogin } = useContext(UserContext);
  const { submitHandler } = useFormSubmitHandler<LoginDto>({
    onSubmit: async (data) => {
      const user = await userService.login(data);
      onSuccessfulLogin(user);
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
        disabled={isSubmitting}
        error={errors.password?.message}
      />
      <Button type="submit" disabled={isSubmitting}>
        Login
      </Button>
    </form>
  );
};
