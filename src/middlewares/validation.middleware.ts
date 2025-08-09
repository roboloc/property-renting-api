import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";

export const validateBody = (dto: any) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(dto, request.body);

    const errors = await validate(dtoInstance);
    //errornya dalam bentur array
    //errors[0]. kita akan ambil constraintnya

    if (errors.length > 0) {
      const message = errors
        .map((error) => Object.values(error.constraints || {}).join(", "))
        .join(", ");

      response.status(400).send({ message });
      return;
    }
    next();
  };
};

//dto adalah data transfer object yang berarti request body kita apa aja
