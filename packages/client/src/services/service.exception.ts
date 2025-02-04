import { ProblemDetails } from "chess-shared-types";

export class ServiceException extends Error {
  constructor(readonly details: ProblemDetails) {
    super(details.title);
  }
}
