
export enum LogLevel {
    trace    = 0,
    debug    = 1,
    info     = 2,
    warn     = 3,
    error    = 4,
    critical = 5
}

export interface GrafeLogger {

    log(level: LogLevel, data: string): void;

    trace(data: string): void;
    debug(data: string): void;
    info(data: string): void;
    warn(data: string): void;
    error(data: string): void;
    critical(data: string): void;

    logLevel: LogLevel;
}

export class BasicLogger implements GrafeLogger {
    logLevel: LogLevel;

    log(level: LogLevel, data: string): void {
        const logLevelConversionArray = ['trace', 'debug', 'info', 'warn', 'error', 'cirtical'];
        this[logLevelConversionArray[level]](data);
    }
    
    trace(data: string): void {
        if (LogLevel.trace === this.logLevel) {
            console.log('TRACE: ' + data);
        }
    }
    
    debug(data: string): void {
        if (LogLevel.debug >= this.logLevel) {
            console.log('DEBUG: ' + data);
        }
    }
    
    info(data: string): void {
        if (LogLevel.info >= this.logLevel) {
            console.log('INFO: ' + data);
        }
    }
    
    warn(data: string): void {
        if (LogLevel.warn >= this.logLevel) {
            console.log('WARN: ' + data);
        }
    }
    
    error(data: string): void {
        if (LogLevel.error >= this.logLevel) {
            console.log('ERROR: ' + data);
        }
    }
    
    critical(data: string): void {
        if (LogLevel.critical >= this.logLevel) {
            console.log('CRITICAL: ' + data);
        }
    }
    
}
