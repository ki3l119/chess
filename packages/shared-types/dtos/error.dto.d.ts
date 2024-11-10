export type ValidationError = {
  message: string;
  details: {
    message: string;
    path: (string | number)[];
  }[];
};
