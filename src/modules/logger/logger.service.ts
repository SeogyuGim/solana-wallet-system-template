import * as winston from 'winston';
import { ConsoleLogger as CustomLogger, Injectable, Scope } from '@nestjs/common';
import * as winstonDaily from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = winston.format;
const logDir = 'logs';
const transports = [
	new winstonDaily({
		level: 'info',
		datePattern: 'YYYY-MM-DD',
		dirname: logDir,
		filename: `%DATE%.log`,
		maxFiles: 30,
		zippedArchive: true,
	}),
	new winstonDaily({
		level: 'error',
		datePattern: 'YYYY-MM-DD',
		dirname: logDir + '/error',
		filename: `%DATE%.error.log`,
		maxFiles: 30,
		zippedArchive: true,
	}),
];

const loggerFormat = printf(({ level, message, timestamp }) => {
	return colorize().colorize(level, `${timestamp} [${level}] : ${message}`);
});

@Injectable({ scope: Scope.TRANSIENT })
export default class LoggerService extends CustomLogger {
	constructor(
		private readonly logger = winston.createLogger({
			levels: winston.config.npm.levels,
			format: combine(
				timestamp({
					format: 'YYYY-MM-DD HH:mm:ss',
				}),
				loggerFormat,
			),
			transports,
		}),
	) {
		super();
	}
}
