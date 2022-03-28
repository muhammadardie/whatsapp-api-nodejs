const fs   = require('fs')
const path = require('path');
const { WhatsAppInstance } = require('../class/instance')
const sleep = require('../helper/sleep')

async function keyVerifcation(req, res, next) {
    const key = req.query['key']?.toString()
    if (!key) {
        return res
            .status(403)
            .send({ error: true, message: 'no key query was present' })
    }
    const instance = WhatsAppInstances[key]
    if (!instance) {
        const anyKeyInRestoredSess = await checkRestoredSessions(key)

        if(anyKeyInRestoredSess.length == 0) 
        {
            return res
                .status(403)
                .send({ error: true, message: 'invalid key supplied' })
        }
    }

    next()
}

async function checkRestoredSessions(key){
    let restoredSessions = []
    const instances = fs.readdirSync(path.join(__dirname, `../sessiondata`))
    instances.map((file) => {
        if (file.includes('.json')) {
            const keyInSession = file.replace('.json', '');

            if(key === keyInSession) restoredSessions.push(keyInSession);
        }
    })

    restoredSessions.map((key) => {
        const instance = new WhatsAppInstance(key)
        instance.init()
        WhatsAppInstances[key] = instance
    })

    await sleep(2000) // wait 1 sec to syncronize sessions

    return restoredSessions;
}

module.exports = keyVerifcation
