const app    = require('./config/express')
const { express: {port} } = require('./config/config')
const http   = require('http');
const path   = require('path');
const fs     = require('fs')
const logger = require('pino')()
const { restoreSessions } = require('./api/helper/session')
let server

server = http.createServer(app);

// check if https set in env
if(process.env.HTTPS === 'true')
{
    const https = require('https');
    const key   = fs.readFileSync(path.resolve(__dirname, process.env.HTTPS_KEY_PATH));
    const cert  = fs.readFileSync(path.resolve(__dirname, process.env.HTTPS_CERT_PATH));
    const options = {
      key: key,
      cert: cert
    };

    server = https.createServer(options, app);
}

// start server
server.listen(port, () => {
    logger.info(`Listening to port ${port}`)
})

restoreSessions()

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed')
            process.exit(1)
        })
    } else {
        process.exit(1)
    }
}

const unexpectedErrorHandler = (error) => {
    logger.error(error)
    exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
    logger.info('SIGTERM received')
    if (server) {
        server.close()
    }
})

module.exports = app
