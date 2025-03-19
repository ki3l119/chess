import React, { useEffect, useState } from "react";
import "./game-history.scss";
import { Table, TableProps } from "@/components/table/table";
import { gameService, ServiceException } from "@/services";
import { GameHistoryDto } from "chess-shared-types";
import { useUser } from "@/contexts";
import { Spinner } from "@/components/spinner/spinner";
import { Alert } from "@/components/alert/alert";

export const GameHistory: React.FC = () => {
  const user = useUser();
  const [gameHistory, setGameHistory] = useState<GameHistoryDto>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchGameHistory = async (page: number) => {
    try {
      setIsLoading(true);
      const result = await gameService.getHistory({
        pagination: {
          page: page,
          pageSize: 30,
        },
      });
      setGameHistory(result);
    } catch (e) {
      if (e instanceof ServiceException) {
        setErrorMessage(e.details.details);
      } else {
        setErrorMessage("Cannot get game history at this time.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGameHistory(1);
  }, []);

  const reasonMapping = {
    CHECKMATE: "by checkmate",
    STALEMATE: "by stalemate",
    FIFTY_MOVE_RULE: "by 50-move rule",
    ABANDONED: "game was abandoned",
    TIMEOUT: "by timeout",
    RESIGNED: "by resignation",
  };

  const rows: TableProps["rows"] = gameHistory
    ? gameHistory.games.map((game) => {
        const whitePlayer = game.whitePlayer?.name || "Guest";
        const blackPlayer = game.blackPlayer?.name || "Guest";
        const result =
          game.winner === null
            ? "Draw"
            : (game.winner === "WHITE" && game.whitePlayer?.id == user.id) ||
                (game.winner === "BLACK" && game.blackPlayer?.id == user.id)
              ? "Win"
              : "Lose";

        const dateString = new Date(game.startTime).toLocaleDateString(
          undefined,
          {
            month: "long",
            day: "2-digit",
            year: "numeric",
          },
        );

        return {
          key: game.id,
          columns: [
            {
              key: "White Pieces",
              element: whitePlayer,
            },
            {
              key: "Black Pieces",
              element: blackPlayer,
            },
            {
              key: "Result",
              element: (
                <div className="game-history__result">
                  <div
                    className={`game-history__result-tag game-history__result-tag--${result.toLowerCase()}`}
                  >
                    {result}
                  </div>
                  <p>{reasonMapping[game.reason]}</p>
                </div>
              ),
            },
            {
              key: "Date",
              element: dateString,
            },
          ],
        };
      })
    : [];

  return (
    <div className="game-history">
      <h1 className="game-history__title">Game History</h1>
      {isLoading ? (
        <div className="game-history__spinner">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <Alert message={errorMessage} type="error" />
      ) : gameHistory && gameHistory.games.length === 0 ? (
        <p>No Games Found</p>
      ) : (
        gameHistory && (
          <Table
            headers={["White Pieces", "Black Pieces", "Result", "Date"]}
            rows={rows}
            minWidth="500px"
            pagination={{
              onPageChange: (newPage) => {
                fetchGameHistory(newPage);
              },
              ...gameHistory.pagination,
            }}
          />
        )
      )}
    </div>
  );
};
