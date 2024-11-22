import { Axios } from "axios";

import { CreateUserDto, UserDto } from "chess-shared-types";

export class UserService {
  constructor(private readonly axios: Axios) {}

  async register(createUserDto: CreateUserDto): Promise<UserDto> {
    const response = await this.axios.post<UserDto>(
      "/api/users",
      createUserDto,
    );
    return response.data;
  }
}
