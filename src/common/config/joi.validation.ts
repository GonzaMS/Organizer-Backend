import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  port: Joi.number().default(3000),

  defaultLimit: Joi.number().default(10),

  offset: Joi.number().default(0),

  enviroment: Joi.string().default('dev'),

  // postgresqlHost: Joi.required(),
});
