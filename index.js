const uuid = require('uuid/v4');
const chalk = require('chalk');
const moment = require('moment');


let defaultOptions = {
  dateFormat(date) {
    return moment(date).format('YYYY/MM/DD, h:mm:ss a')
  },

  color(status) {
    if (status < 400) {
      return 'green';
    } else if (status < 500) {
      return 'gray';
    }
    return 'red';
  },

  async fillInfo(ctx) {
    ctx.__logInfo = ctx.state.__logInfo = {};
  },

  correlactionId: false,
  async correlationId(ctx) {
    if (this.correlactionId) {
      const correlationId = uuid();
      ctx.__logInfo.correlationId = correlationId;
      ctx.state.__logInfo.correlationId = correlationId;
      ctx.response.set('X-Correlation-Id', correlationId);
    }
  },

  async fillError(ctx) {
    ctx.__infoError = ctx.state.__infoError = Object.assign({}, ctx.__logInfo, {
      query: ctx.request.query,
      method: ctx.request.method,
      url: ctx.request.url,
      DeviceId: ctx.request.get('DeviceId'),
      path: ctx.request.path,
      ip: ctx.request.ip,
      host: ctx.request.host,
      protocol: ctx.request.protocol,
    });
  },

  onStartFormat(ctx) {
    const start = ctx.__logger.start;
    return `--> ${chalk.blue(this.dateFormat(start))} - ${chalk.bold(ctx.method)} ${chalk.blue.bold(ctx.url)}`;
  },

  async onStart(ctx) {
    const info = Object.assign({}, ctx.__logInfo, { logType: 'routeStart' });
    this.logger.info(this.onStartFormat(ctx), info);
  },

  onErrorFormat(ctx) {
    return `${chalk.red('[ERROR]')} ${chalk.red.bold(ctx.method)} ${ctx.url}`;
  },

  async onError(ctx, err) {
    const info = Object.assign({}, ctx.state.__infoError, {
      error: err,
      logType: 'routeError'
    });
    this.logger.error(this.onErrorFormat(ctx), info);

    throw err;
  },

  onEndFormat(ctx, timeTake) {
    const status = ctx.__logger.status;
    const fColor = chalk[this.color(status)];
    const now = this.dateFormat(Date.now());

    return `<-- ${fColor(now)} - ${fColor.bold(status)} ${chalk.bold(ctx.method)} ${ctx.url} - ${fColor(timeTake + ' ms')}`;
  },

  async onEnd(ctx) {
    const timeTake = Date.now() - ctx.__logger.start;
    const info = Object.assign({}, ctx.__logInfo, { logType: 'routeEnd' });
    this.logger.info(this.onEndFormat(ctx, timeTake), info);
  },

  logger: console, // eslint-disable-line
};

module.exports = function Logger(options = {}) {
  opt = Object.assign({}, defaultOptions, options);
  logger = async (ctx, next) => {
    ctx.__logger = { status: 500, start: Date.now() };
    try {
      await this.opt.fillInfo(ctx);
      await this.opt.correlationId(ctx);
      await this.opt.fillError(ctx);
      await this.opt.onStart(ctx);
      await next();
      ctx.__logger.status = ctx.status;
    } catch (err) {
      await this.opt.onError(ctx, err);
    } finally {
      await this.opt.onEnd(ctx);
    }
  }
  return this.logger;
};