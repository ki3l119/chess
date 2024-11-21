import { ProblemDetails } from "chess-shared-types";

/**
 * Exceptions that arises from invalid data from the user.
 */
export class UserErrorException extends Error implements ProblemDetails {
  readonly title: string;
  readonly details: string;
  readonly validationErrors?:
    | { message: string; path: (string | number)[] }[]
    | undefined;

  constructor(problemDetails: ProblemDetails) {
    super(problemDetails.title);
    this.title = problemDetails.title;
    this.details = problemDetails.details;
    this.validationErrors = problemDetails.validationErrors;
  }
}
