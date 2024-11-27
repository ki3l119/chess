import { Axios } from "axios";

import { CreateUserDto, LoginDto, UserDto } from "chess-shared-types";

export class UserService {
  constructor(private readonly axios: Axios) {}

  async register(createUserDto: CreateUserDto): Promise<UserDto> {
    const response = await this.axios.post<UserDto>(
      "/api/users",
      createUserDto,
    );
    return response.data;
  }

  async login(loginDto: LoginDto): Promise<UserDto> {
    const response = await this.axios.post<UserDto>(
      "/api/users/auth",
      loginDto,
      {
        withCredentials: true,
      },
    );
    return response.data;
  }

  async getCurrentUser(): Promise<UserDto> {
    const response = await this.axios.get<UserDto>("/api/users/me", {
      withCredentials: true,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    return this.axios.delete("/api/users/auth", {
      withCredentials: true,
    });
  }
}
