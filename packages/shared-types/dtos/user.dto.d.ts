export type CreateUserDto = {
  username: string;
  email: string;
  password: string;
};

export type UserDto = {
  id: string;
  username: string;
  email: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type SessionDto = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};
