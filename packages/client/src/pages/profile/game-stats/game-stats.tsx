import React, { useEffect, useState } from "react";

import "./game-stats.scss";
import { gameService, ServiceException } from "@/services";
import { GameHistoryStatsDto } from "chess-shared-types";
import { Spinner } from "@/components/spinner/spinner";
import { Alert } from "@/components/alert/alert";

type GameStatisticProps = {
  stats: GameHistoryStatsDto;
  show: "totalGames" | "wins" | "losses" | "draws";
};

const GameStatistic: React.FC<GameStatisticProps> = ({ stats, show }) => {
  const title = {
    wins: "Wins",
    totalGames: "Total Games",
    losses: "Losses",
    draws: "Draws",
  };

  const showPercentage = show !== "totalGames";

  const value = showPercentage
    ? stats.totalGames > 0
      ? ((stats[show] / stats.totalGames) * 100).toFixed(2)
      : 0
    : stats[show];

  const valueClasses = ["game-stats__stat-value"];

  if (show !== "totalGames") {
    valueClasses.push(`game-stats__stat-value--${show}`);
  }
  return (
    <div className="game-stats__statistic">
      <p>{title[show]}</p>
      <p className={valueClasses.join(" ")}>
        {value}
        {showPercentage ? "%" : ""}
      </p>
      {showPercentage && (
        <p>
          ({stats[show]} {stats[show] !== 1 ? "games" : "game"})
        </p>
      )}
    </div>
  );
};

export const GameStats: React.FC = () => {
  const [stats, setStats] = useState<GameHistoryStatsDto>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        const gameStats = await gameService.getHistoryStats();
        setStats(gameStats);
      } catch (e) {
        if (e instanceof ServiceException) {
          setErrorMessage(e.details.details);
        } else {
          setErrorMessage("An unexpected error has occured.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchGameStats();
  }, []);

  const statsOrder = ["totalGames", "wins", "losses", "draws"] as const;

  return (
    <div className="game-stats">
      <p className="game-stats__title">Game Statistics</p>
      {isLoading ? (
        <div className="game-stats__spinner">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <Alert message={errorMessage} type="error" />
      ) : (
        stats && (
          <div className="game-stats__statistics">
            {statsOrder.map((show) => (
              <GameStatistic key={show} stats={stats} show={show} />
            ))}
          </div>
        )
      )}
    </div>
  );
};
