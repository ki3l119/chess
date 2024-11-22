import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import { CreateUserDto } from "chess-shared-types";
import "./registration-form.scss";
import { userService, ServiceException } from "../../services";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Alert } from "../alert/alert";

export const RegistrationForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
    reset,
  } = useForm<CreateUserDto>();

  const onSubmit: SubmitHandler<CreateUserDto> = async (data) => {
    try {
      await userService.register(data);
      reset();
    } catch (error) {
      if (error instanceof ServiceException) {
        setError("root.serverError", {
          type: "custom",
          message: error.details.details,
        });
        if (error.details.validationErrors != undefined) {
          for (const validationError of error.details.validationErrors) {
            setError(validationError.path[0] as keyof CreateUserDto, {
              type: "custom",
              message: validationError.message,
            });
          }
        }
      } else {
        setError("root.serverError", {
          type: "custom",
          message: "Unknown error has occured. Please try again later.",
        });
      }
    }
  };

  return (
    <form className="registration-form" onSubmit={handleSubmit(onSubmit)}>
      {isSubmitSuccessful && (
        <Alert type="success" message="Successfully created user account." />
      )}
      {errors.root?.serverError?.message && (
        <Alert type="error" message={errors.root.serverError.message} />
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
        disabled={isSubmitting}
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
        disabled={isSubmitting}
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
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        Register
      </Button>
    </form>
  );
};
