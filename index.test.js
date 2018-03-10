const logger = require('./index');

describe('Logger', function () {
  beforeEach(() => {
    this.ctx = {
      status: 200,
      state: {},
      method: 'GET',
      url: '/index-url',
      request: {
        query: '/index',
        method: 'GET',
        url: '/index-url',
        path: '/index-path',
        ip: '::1',
        route: '/index-route',
        host: 'localhost',
        protocol: 'ipv4',
        get: () => 'device-id',
      },
      response: {
        set: () => { },
      }
    }
  });

  it('Should be able to redefine options', async () => {
    let call = 0;
    const opt = {
      async fillInfo(ctx) {
        call++;
        ctx.__logInfo = ctx.state.__logInfo = { myInfo: 'tutu' };
      },
    };

    await logger(opt)(this.ctx, () => { });
    expect(call).toBe(1);
  });

  it('Should not call loggerError when success', async () => {
    const myLogger = { info: jest.fn(), error: jest.fn() };
    const opt = { logger: myLogger };

    await logger(opt)(this.ctx, () => { });
    expect(myLogger.info).toBeCalled();
    expect(myLogger.error).not.toBeCalled();
  });

  it('Should call loggerError on error', async () => {
    const msg = 'my error';
    let errorMsg;
    try {
      await logger()(this.ctx, () => { throw new Error(msg) });
    } catch (err) {
      errorMsg = err.message;
    }
    expect(errorMsg).toBe('my error');
  });
})
