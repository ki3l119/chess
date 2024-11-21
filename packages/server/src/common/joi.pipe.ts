import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { ObjectSchema } from "joi";

import { UserErrorException } from "./user-error.exception";

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}

  transform(value: any): any {
    const result = this.schema.validate(value);

    if (result.error) {
      const validationErrors = result.error.details.map((error) => ({
        message: error.message,
        path: error.path,
      }));

      throw new UserErrorException({
        title: "Invalid input.",
        details: "Encountered validation errors in input.",
        validationErrors,
      });
    }
    return result.value;
  }
}
