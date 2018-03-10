# koa-logger-middleware

<img src="log.png" alt="Koa logger middleware"/>

## Configuration

* **correlactionId**: Boolean - add an correlactionId and set header X-Correlation-Id to it.
* **logger**: Object - eg: winstonjs, by default is console with coloration.  
    ```js
    const winstonLogger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
          colorize: true,
        })
      ]
    });

    logger({ logger: winstonLogger });
    ```
See the file index.js to see all options

## License

  MIT © [YSO Corp](http://ysocorp.com/)
