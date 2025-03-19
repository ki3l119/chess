import { Axios } from "axios";
import {
  GameHistoryDto,
  GameHistoryStatsDto,
  PageBasedPagination,
} from "chess-shared-types";

type GetHistoryOptions = {
  pagination?: PageBasedPagination;
};

export class GameService {
  constructor(private readonly axios: Axios) {}

  async getHistoryStats(): Promise<GameHistoryStatsDto> {
    const response = await this.axios.get<GameHistoryStatsDto>(
      "/api/games/history/stats",
      {
        withCredentials: true,
      },
    );
    return response.data;
  }

  async getHistory(options: GetHistoryOptions = {}): Promise<GameHistoryDto> {
    let params: { [key: string]: string } = {};
    if (options.pagination) {
      params["page"] = options.pagination.page.toString();
      params["pageSize"] = options.pagination.pageSize.toString();
    }
    const response = await this.axios.get<GameHistoryDto>(
      "/api/games/history",
      {
        params,
        withCredentials: true,
      },
    );

    return response.data;
  }
}
