export type WebSocketMessage = {
  event: string;
  data: any;
};

export type WebSocketMessageWithResult = WebSocketMessage & {
  id: string;
};

export type EventMessageCallback = (data: any) => void;

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
