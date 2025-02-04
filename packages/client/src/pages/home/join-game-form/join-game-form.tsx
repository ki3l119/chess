import React from "react";
import { useForm } from "react-hook-form";

import { JoinGameDto, JoinGameSuccessDto } from "chess-shared-types";
import "./join-game-form.scss";
import { useGame } from "../game.context";
import { Input } from "@/components/input/input";
import { Button } from "@/components/button/button";
import { Alert } from "@/components/alert/alert";
import { useFormSubmitHandler } from "@/hooks/form-submit-handler";

export type JoinGameFormProps = {
  onJoin?: (data: JoinGameSuccessDto) => void;
};

export const JoinGameForm: React.FC<JoinGameFormProps> = ({ onJoin }) => {
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<JoinGameDto>();
  const { gameManager } = useGame();
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
