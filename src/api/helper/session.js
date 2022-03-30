const fs   = require('fs')
const path = require('path');
const { WhatsAppInstance } = require('../class/instance')
const sleep = require('./sleep')
const logger = require('pino')()

exports.restoreSessions = async () => {
    try {
        logger.info('Start restoring any exist sessions...')
        let restoredSessions = []
        const instances = fs.readdirSync(path.join(__dirname, `../sessiondata`))
        instances.map((file) => {
            if (file.includes('.json')) {
                restoredSessions.push(file.replace('.json', ''))
            }
        })
        restoredSessions.map((key) => {
            const instance = new WhatsAppInstance(key)
            instance.init()
            WhatsAppInstances[key] = instance
        })
    } catch (error) {
        return res.json({
            error: true,
            message: 'Failed to restore sessions',
            data: error
        })
    }
}