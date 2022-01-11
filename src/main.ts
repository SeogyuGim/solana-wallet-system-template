import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import fmp from 'fastify-multipart';
import fastifyHelmet from 'fastify-helmet';

import Logger from '@modules/logger/logger.service';
import { AppModule } from './app.module';

async function bootstrap() {
	process.addListener('SIGINT', () => {
		process.kill(process.pid);
	});

	// Creating App instance
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

	// setting multi-part
	await app.register(fmp);

	// setting Logger
	app.useLogger(new Logger());

	// setting PipeLine
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			disableErrorMessages: process.env.NODE_ENV !== 'production',
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	// setting CORS
	app.enableCors({
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		preflightContinue: false,
		optionsSuccessStatus: 204,
	});

	// setting HTTP helmet
	await app.register(fastifyHelmet);

	// setting app to listen on PORT(default:8080)
	await app.listen(process.env.PORT || 8080, '0.0.0.0');
}

bootstrap();
