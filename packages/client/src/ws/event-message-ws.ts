import { ProblemDetails } from "chess-shared-types";

export type WebSocketMessage = {
  event: string;
  data: any;
};

export type MessageCallback = (data: any) => void;

export class EventMessageWebSocketException extends Error {
  constructor(
    readonly problemDetails: ProblemDetails,
    /**
     * The event message sent by the client that caused the error.
     */
    readonly event: string,
  ) {
    super(problemDetails.details);
  }
}

/**
 * A WebSocket that is expected to send/recieve messages in the form
 * { event, data } as a JSON string.
 */
export class EventMessageWebSocket extends WebSocket {
  private readonly eventMessageHandlers: Map<string, MessageCallback[]>;

  constructor(url: string | URL, protocols?: string | string[]) {
    super(url, protocols);
    this.eventMessageHandlers = new Map();
    this.addEventListener("message", (event) => {
      const eventMessage = JSON.parse(event.data);
      if (typeof eventMessage.event === "string") {
        const handlers = this.eventMessageHandlers.get(eventMessage.event);
        if (handlers) {
          for (const handler of handlers) {
            handler(eventMessage.data);
          }
        }
      }
    });
  }

  /**
   * Sends the specified message as a JSON string.
   */
  sendMessage(message: WebSocketMessage) {
    this.send(JSON.stringify(message));
  }

  /**
   * Sends the event message with an expected response from server.
   *
   * The server is expected to emit a event:success or event:error message.
   */
  sendMessageWithResponse<T>(message: WebSocketMessage): Promise<T> {
    let successCallback: (data: T) => void;
    let errorCallback: (data: ProblemDetails) => void;
    const successEvent = `${message.event}:success`;
    const errorEvent = `${message.event}:error`;
    return new Promise<T>((resolve, reject) => {
      successCallback = (data) => {
        resolve(data);
      };
      errorCallback = (data) => {
        reject(new EventMessageWebSocketException(data, message.event));
      };
      this.addMessageListener(successEvent, successCallback);
      this.addMessageListener(errorEvent, errorCallback);

      this.sendMessage(message);
    }).finally(() => {
      this.removeMessageListener(successEvent, successCallback);
      this.removeMessageListener(errorEvent, errorCallback);
    });
  }

  /**
   * Invokes the callback whenever a JSON string message is received where
   * the event property is equal to the event.
   */
  addMessageListener(event: string, callback: MessageCallback) {
    let handlers = this.eventMessageHandlers.get(event);
    if (!handlers) {
      handlers = [];
      this.eventMessageHandlers.set(event, handlers);
    }
    handlers.push(callback);
  }

  removeMessageListener(event: string, callback: MessageCallback) {
    let handlers = this.eventMessageHandlers.get(event);
    if (!handlers) {
      return;
    }
    const callbackIndex = handlers.indexOf(callback);
    if (callbackIndex !== -1) {
      handlers.splice(callbackIndex, 1);
    }
    if (handlers.length === 0) {
      this.eventMessageHandlers.delete(event);
    }
  }
}
