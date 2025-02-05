import React from "react";
import { useForm } from "react-hook-form";

import { JoinGameDto } from "chess-shared-types";
import "./join-game-form.scss";
import { Input } from "@/components/input/input";
import { Button } from "@/components/button/button";
import { Alert } from "@/components/alert/alert";
import { useFormSubmitHandler } from "@/hooks/form-submit-handler";
import { Game } from "../game";
import { GameManager } from "../game-manager";

export type JoinGameFormProps = {
  onJoin?: (game: Game) => void;
  gameManager: GameManager;
};

export const JoinGameForm: React.FC<JoinGameFormProps> = ({
  onJoin,
  gameManager,
}) => {
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<JoinGameDto>();
  const { submitHandler } = useFormSubmitHandler({
    onSubmit: async (data) => {
      const result = await gameManager.joinGame(data);
      if (onJoin) {
        onJoin(result);
      }
    },
    setError,
  });

  return (
    <form className="join-game-form" onSubmit={handleSubmit(submitHandler)}>
      {errors.root?.serverError.message && (
        <Alert message={errors.root.serverError.message} type="error" />
      )}
      <Input
        {...register("gameId", {
          required: "Please enter the game id",
        })}
        label="Game ID"
        error={errors.gameId?.message}
      />
      <Button type="submit">Join</Button>
    </form>
  );
};
