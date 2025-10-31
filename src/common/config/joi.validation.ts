import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  DEFAULT_LIMIT: Joi.number().default(10),

  OFFSET: Joi.number().default(0),

  NODE_ENV: Joi.string().default('dev'),

  JWT_SECRET: Joi.string().required(),

  POSTGRESQL_HOST: Joi.string().required(),
  POSTGRESQL_PORT: Joi.number().required(),
  POSTGRESQL_USER: Joi.string().required(),
  POSTGRESQL_DB: Joi.string().required(),
  POSTGRESQL_PASSWORD: Joi.string().required(),
});
