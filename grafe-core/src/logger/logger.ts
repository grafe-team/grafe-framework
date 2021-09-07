export enum LogLevel {
    trace = 0,
    debug = 1,
    info = 2,
    warn = 3,
    error = 4,
    critical = 5,
}

export interface GrafeLogger {
    log(level: LogLevel, data: string, ...parameters: any): void;

    trace(data: string, ...parameters: any): void;
    debug(data: string, ...parameters: any): void;
    info(data: string, ...parameters: any): void;
    warn(data: string, ...parameters: any): void;
    error(data: string, ...parameters: any): void;
    critical(data: string, ...parameters: any): void;

    logLevel: LogLevel;
}

export class BasicLogger implements GrafeLogger {
    logLevel: LogLevel;

    log(level: LogLevel, data: string, ...parameters: any): void {
        const logLevelConversionArray = [
            'trace',
            'debug',
            'info',
            'warn',
            'error',
            'critical',
        ];
        // @ts-ignore
        this[logLevelConversionArray[level]](data, ...parameters);
    }

    trace(data: string, ...parameters: any): void {
        if (LogLevel.trace === this.logLevel) {
            console.log('TRACE: ' + data, ...parameters);
        }
    }

    debug(data: string, ...parameters: any): void {
        if (LogLevel.debug >= this.logLevel) {
            console.log('DEBUG: ' + data, ...parameters);
        }
    }

    info(data: string, ...parameters: any): void {
        if (LogLevel.info >= this.logLevel) {
            console.log('INFO: ' + data, ...parameters);
        }
    }

    warn(data: string, ...parameters: any): void {
        if (LogLevel.warn >= this.logLevel) {
            console.log('WARN: ' + data, ...parameters);
        }
    }

    error(data: string, ...parameters: any): void {
        if (LogLevel.error >= this.logLevel) {
            console.log('ERROR: ' + data, ...parameters);
        }
    }

    critical(data: string, ...parameters: any): void {
        if (LogLevel.critical >= this.logLevel) {
            console.log('CRITICAL: ' + data, ...parameters);
        }
    }
}
