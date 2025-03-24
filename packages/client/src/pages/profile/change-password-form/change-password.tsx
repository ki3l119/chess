import React from "react";
import { useForm } from "react-hook-form";

import "./change-password.scss";
import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { Alert } from "@/components/alert/alert";
import { ChangePasswordDto } from "chess-shared-types";
import { useFormSubmitHandler } from "@/hooks/form-submit-handler";
import { userService } from "@/services";

type ChangePasswordInputs = ChangePasswordDto & {
  confirmPassword: string;
};

export const ChangePasswordForm: React.FC = () => {
  const {
    register,
    formState: { isSubmitting, errors, isSubmitSuccessful },
    setError,
    handleSubmit,
    reset,
  } = useForm<ChangePasswordInputs>();
  const { submitHandler } = useFormSubmitHandler<ChangePasswordInputs>({
    onSubmit: async (data) => {
      const { confirmPassword, ...changePasswordDto } = data;
      await userService.changePassword(changePasswordDto);
      reset();
    },
    setError,
  });

  return (
    <form
      className="change-password-form"
      onSubmit={handleSubmit(submitHandler)}
    >
      {errors.root?.serverError?.message && (
        <Alert type="error" message={errors.root.serverError.message} />
      )}
      {isSubmitSuccessful && (
        <Alert type="success" message="Successfully updated password." />
      )}
      <Input
        type="password"
        label="Old Password"
        disabled={isSubmitting}
        {...register("oldPassword", {
          required: "Please enter your old password.",
          maxLength: {
            value: 128,
            message: "Cannot exceed 128 characters.",
          },
          minLength: {
            value: 8,
            message: "Must be at least 8 characters.",
          },
        })}
        error={errors.oldPassword?.message}
      />
      <Input
        type="password"
        label="New Password"
        disabled={isSubmitting}
        {...register("newPassword", {
          required: "Please enter your new password.",
          maxLength: {
            value: 128,
            message: "Cannot exceed 128 characters.",
          },
          minLength: {
            value: 8,
            message: "Must be at least 8 characters.",
          },
        })}
        error={errors.newPassword?.message}
      />
      <Input
        type="password"
        label="Confirm Password"
        disabled={isSubmitting}
        {...register("confirmPassword", {
          required: "Please repeat your password.",
          validate: (confirmPassword, { newPassword }) => {
            return (
              confirmPassword === newPassword ||
              "Must be equal to new password."
            );
          },
        })}
        error={errors.confirmPassword?.message}
      />
      <Button type="submit" disabled={isSubmitting}>
        Change Password
      </Button>
    </form>
  );
};
