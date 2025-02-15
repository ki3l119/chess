import React from "react";
import { useForm } from "react-hook-form";

import { CreateGameDto } from "chess-shared-types";
import "./create-game-form.scss";
import { Select } from "@/components/select/select";
import { Button } from "@/components/button/button";
import { useFormSubmitHandler } from "@/hooks/form-submit-handler";
import { Alert } from "@/components/alert/alert";
import { GameManager } from "../game-manager";
import { Game } from "../game";
import { Input } from "@/components/input/input";

export type CreateGameFormProps = {
  onCreate?: (game: Game) => void;
  gameManager: GameManager;
};

export const CreateGameForm: React.FC<CreateGameFormProps> = ({
  onCreate,
  gameManager,
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<CreateGameDto>();
  const { submitHandler } = useFormSubmitHandler<CreateGameDto>({
    onSubmit: async (data) => {
      const result = await gameManager.createGame({
        color: data.color,
        playerTimerDuration: data.playerTimerDuration * 60,
      });
      if (onCreate) {
        onCreate(result);
      }
    },
    setError,
  });

  return (
    <form className="create-game-form" onSubmit={handleSubmit(submitHandler)}>
      {errors.root?.serverError?.message && (
        <Alert type="error" message={errors.root.serverError.message} />
      )}
      <Select
        error={errors.color?.message}
        label="Your Piece Color"
        selectOptions={[
          { value: "RANDOM", display: "Random" },
          { value: "WHITE", display: "White" },
          { value: "BLACK", display: "Black" },
        ]}
        {...register("color")}
        disabled={isSubmitting}
      />
      <Input
        error={errors.playerTimerDuration?.message}
        label="Player Timer Duration (minutes)"
        type="number"
        {...register("playerTimerDuration", {
          required: "Please enter a number.",
          max: {
            value: 60,
            message: "Game cannot exceed 60 minutes.",
          },
          min: {
            value: 1,
            message: "Game must be at least 1 minute.",
          },
        })}
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        Create
      </Button>
    </form>
  );
};
