import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { ObjectSchema } from "joi";

import { ValidationError } from "chess-shared-types";

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  private readonly errorMessage: string;

  constructor(
    private readonly schema: ObjectSchema,
    errorMessage?: string,
  ) {
    this.errorMessage = errorMessage || "Validation error.";
  }

  transform(value: any): any {
    const result = this.schema.validate(value);

    if (result.error) {
      const validationError: ValidationError = {
        message: this.errorMessage,
        details: result.error.details.map((error) => ({
          message: error.message,
          path: error.path,
        })),
      };
      throw new BadRequestException(validationError);
    }
    return result.value;
  }
}
