
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';

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
import { NextFunction, Request, Response } from 'express';

@Catch(NotFoundException)
class NotFoundLoggingFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const responseBody = exception.getResponse();

    response.locals.__notFoundLogged = true;
    this.logger.warn(
      `${request.method} ${request.originalUrl} -> ${status} (${exception.message})`,
    );

    if (response.headersSent) {
      return;
    }

    if (typeof responseBody === 'string') {
      response.status(status).send(responseBody);
      return;
    }

    response.status(status).json(responseBody);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const logger = new Logger('HTTP');
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      logger.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`);

    });
    next();
  });


  app.useGlobalFilters(new NotFoundLoggingFilter(logger));

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

  // app.use(xss());
  // app.use(mongoSanitize());
  app.use(helmet());
  await app.listen(process.env.PORT || AppConfig.PORT);
}
bootstrap();
