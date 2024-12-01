import { Injectable } from "@nestjs/common";

import { JoiValidationPipe, UserErrorException } from "../common";
import { WebSocketException } from "./ws.exception";
import { ObjectSchema } from "joi";

@Injectable()
export class WebSocketJoiValidationPipe extends JoiValidationPipe {
  constructor(
    schema: ObjectSchema,
    private readonly event: string,
  ) {
    super(schema);
  }

  transform(value: any): any {
    try {
      return super.transform(value);
    } catch (e) {
      if (e instanceof UserErrorException) {
        throw new WebSocketException(this.event, {
          title: e.title,
          details: e.details,
          validationErrors: e.validationErrors,
        });
      }
      throw e;
    }
  }
}
