export interface ProblemDetails {
  readonly title: string;
  readonly details: string;
  readonly validationErrors?: {
    message: string;
    path: (string | number)[];
  }[];
}
