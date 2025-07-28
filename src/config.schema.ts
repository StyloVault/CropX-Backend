import * as Joi from '@hapi/joi';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppConfig: any = process.env;

export const configValidationSchema = Joi.object({
  APP_ENV: Joi.string().required(),
  PORT: Joi.number().required(),
  MONGODB_URL: Joi.string().required(),
  BUGSNAG_KEY: Joi.string().required(),
  POSTMARK_API_KEY: Joi.string().required(),
  OPENAI_KEY: Joi.string().optional(),
});
