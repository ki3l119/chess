import React from "react";
import { useForm } from "react-hook-form";

import { JoinGameDto } from "chess-shared-types";
import "./join-game-form.scss";
import { Input } from "@/components/input/input";
import { Button } from "@/components/button/button";
import { Alert } from "@/components/alert/alert";
import { useFormSubmitHandler } from "@/hooks/form-submit-handler";
import { GameSocket } from "../game-socket";
import { GameInfo } from "../utils/chess";

export type JoinGameFormProps = {
  onJoin?: (info: GameInfo) => void;
  gameSocket: GameSocket;
};

export const JoinGameForm: React.FC<JoinGameFormProps> = ({
  onJoin,
  gameSocket,
}) => {
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JoinGameDto>();
  const { submitHandler } = useFormSubmitHandler({
    onSubmit: async (data) => {
      const gameInfo = await gameSocket.joinGame(data);
      if (onJoin) {
        onJoin(gameInfo);
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
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        Join
      </Button>
    </form>
  );
};
