import { ProblemDetails } from "chess-shared-types";
import { ServiceException } from "./service.exception";

export type WebSocketMessage = {
  event: string;
  data: any;
};

export type WebSocketMessageWithResult = WebSocketMessage & {
  id: string;
};

export type EventMessageCallback = (data: any) => void;

export type SendEventMessageOptions = {
  onSuccess?: (data: any) => void;
  onError?: (data: ProblemDetails) => void;
};

/**
 * A WebSocket that is expected to send/recieve messages in the form
 * { event, data } as a JSON string.
 */
export class EventMessageWebSocket extends WebSocket {
  private readonly eventMessageHandlers: Map<string, EventMessageCallback[]>;

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
  sendEventMessage(message: WebSocketMessage) {
    this.send(JSON.stringify(message));
  }

  /**
   * Sends the event message with an expected response from server.
   *
   * The server is expected to emit a event:success or event:error message.
   */
  sendEventMessageWithResponse<T>(message: WebSocketMessage): Promise<T> {
    let successCallback: (data: T) => void;
    let errorCallback: (data: ProblemDetails) => void;
    const successEvent = `${message.event}:success`;
    const errorEvent = `${message.event}:error`;
    return new Promise<T>((resolve, reject) => {
      successCallback = (data) => {
        resolve(data);
      };
      errorCallback = (data) => {
        reject(new ServiceException(data));
      };
      this.addEventMessageHandler(successEvent, successCallback);
      this.addEventMessageHandler(errorEvent, errorCallback);

      this.sendEventMessage(message);
    }).finally(() => {
      this.removeEventMessageHandler(successEvent, successCallback);
      this.removeEventMessageHandler(errorEvent, errorCallback);
    });
  }

  /**
   * Invokes the callback whenever a JSON string message is received where
   * the event property is equal to the event.
   */
  addEventMessageHandler(event: string, callback: EventMessageCallback) {
    let handlers = this.eventMessageHandlers.get(event);
    if (!handlers) {
      handlers = [];
      this.eventMessageHandlers.set(event, handlers);
    }
    handlers.push(callback);
  }

  removeEventMessageHandler(event: string, callback: EventMessageCallback) {
    let handlers = this.eventMessageHandlers.get(event);
    if (!handlers) {
      return;
    }
    const callbackIndex = handlers.indexOf(callback);
    if (callbackIndex !== -1) {
      handlers.splice(callbackIndex, 1);
    }
  }
}
