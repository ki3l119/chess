import { ProblemDetails } from "chess-shared-types";

export class WebSocketException extends Error {
  constructor(
    /**
     * The event name to emit to the client
     */
    public readonly event: string,
    public readonly details: ProblemDetails,
  ) {
    super(details.details);
  }
}
