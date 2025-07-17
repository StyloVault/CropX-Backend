import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config.schema';
import * as xss from 'xss-clean';
import * as cors from 'cors';
import * as mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import Bugsnag from '@bugsnag/js';
import * as bodyParser from 'body-parser';
import bugsnagPluginExpress from '@bugsnag/plugin-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  Bugsnag.start({
    apiKey: AppConfig.BUGSNAG_KEY,
    plugins: [bugsnagPluginExpress],
  });
  const bugsnagMiddleware = Bugsnag.getPlugin('express');
  // app.use(notFound);

  app.use(bugsnagMiddleware?.requestHandler);
  app.use(bugsnagMiddleware?.errorHandler);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(
    cors({
      origin: '*',
    }),
  );

  app.use(
    bodyParser.json({
      limit: '5mb',
      verify: (req: any, res, buf) => {
        console.log(req);
        req.rawBody = buf;
      },
    }),
  );
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(xss());
  app.use(mongoSanitize());
  app.use(helmet());
  await app.listen(process.env.PORT || AppConfig.PORT);
}
bootstrap();
