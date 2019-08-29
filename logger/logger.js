function logDebug(message, fields, level) {
  console.log(`(${level}) - ${message}`, fields);
}

const LOG_LEVELS = {
  trace: 'TRACE',
  debug: 'DEBUG',
  log: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  fatal: 'FATAL',
};

function logJSON(message, fields, level) {
  console.log(
    JSON.stringify({
      '@timestamp': new Date().toISOString(),
      '@message': message,
      '@version': 1,
      level: LOG_LEVELS[level],
      '@fields': fields,
    }),
  );
}

const LOGGERS = {
  json: logJSON,
  debug: logDebug,
};

let activeLogger = logDebug;

export function setLoggerMode(mode) {
  if (!LOGGERS[mode]) {
    throw new Error(`No such logger "${mode}"`);
  }
  activeLogger = LOGGERS[mode];
}

export function log(message, fields, level = 'log') {
  activeLogger(message, fields, level);
}

export function trace(message, fields) {
  return log(message, fields, 'trace');
}

export function debug(message, fields) {
  return log(message, fields, 'debug');
}

export function warn(message, fields) {
  return log(message, fields, 'warn');
}

export function error(message, fields) {
  return log(message, fields, 'error');
}

export function fatal(message, fields) {
  return log(message, fields, 'fatal');
}
