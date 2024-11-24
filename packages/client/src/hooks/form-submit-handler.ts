import { type Path, UseFormSetError, type FieldValues } from "react-hook-form";

import { ServiceException } from "../services";

type FormSubmitHandlerArgs<T extends FieldValues> = {
  onSubmit: (data: T) => Promise<void>;
  setError: UseFormSetError<T>;
};

/**
 * Provides common error handling when form submission fails.
 */
export const useFormSubmitHandler = <T extends FieldValues>({
  onSubmit,
  setError,
}: FormSubmitHandlerArgs<T>) => {
  const submitHandler = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (e) {
      if (e instanceof ServiceException) {
        setError("root.serverError", {
          type: "custom",
          message: e.details.details,
        });
        if (e.details.validationErrors == undefined) {
          return;
        }
        for (const validationError of e.details.validationErrors) {
          setError(validationError.path[0] as Path<T>, {
            type: "custom",
            message: validationError.message,
          });
        }
      } else {
        setError("root.serverError", {
          type: "custom",
          message: "Unknown error occured. Please try again later.",
        });
      }
    }
  };

  return { submitHandler };
};
