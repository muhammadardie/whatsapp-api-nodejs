const { WhatsAppInstance } = require('../class/instance')
const fs = require('fs')
const path = require('path')
const sleep = require('../helper/sleep')

async function getQrCode(key) {
    const qrcode = await WhatsAppInstances[key].instance.qr

    // wait for 1 second until qr generated if not yet then repeat
    if(qrcode === '') {
        await sleep(1000) 

        return getQrCode(key)
    }

    return qrcode;
}

exports.init = async (req, res) => {
    const key = req.query.key
    const webhook = req.query.webhook === undefined ? false : req.query.webhook
    const instance = new WhatsAppInstance(key, webhook)
    const data = await instance.init()
    WhatsAppInstances[data.key] = instance
    res.json({
        error: false,
        message: 'Initializing successfull',
        key: data.key,
    })
}

exports.qr = async (req, res) => {
    try {
        const qrcode = await getQrCode(req.query.key)
        res.render('qrcode', {
            qrcode: qrcode,
        })
    } catch {
        res.json({
            qrcode: '',
        })
    }
}

exports.qrImg = async (req, res) => {
    try {
        const qrcode = await getQrCode(req.query.key)
        const base64Data = qrcode.replace(/^data:image\/png;base64,/, '');
        const img = Buffer.from(base64Data, 'base64');

        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': img.length
        });
        res.end(img);
    } catch {
        res.json({
            qrcode: '',
        })
    }
}

exports.qrbase64 = async (req, res) => {
    try {
        const qrcode = await getQrCode(req.query.key)
        
        res.json({
            error: false,
            message: 'QR Base64 fetched successfully',
            qrcode: qrcode,
        })
    } catch(err) {
        console.log(err)
        res.json({
            qrcode: '',
        })
    }
}

exports.info = async (req, res) => {
    const instance = WhatsAppInstances[req.query.key]
    let data = ''
    try {
        data = await instance.getInstanceDetail(req.query.key)
    } catch (error) {
        data = {}
    }
    return res.json({
        error: false,
        message: 'Instance fetched successfully',
        // instance_data: data,
        instance_data: data,
    })
}

exports.restore = async (req, res, next) => {
    try {
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
        return res.json({
            error: false,
            message: 'All instances restored',
            data: restoredSessions,
        })
    } catch (error) {
        next(error)
    }
}

exports.logout = async (req, res) => {
    let errormsg
    try {
        await WhatsAppInstances[req.query.key].instance?.sock?.logout()
    } catch (error) {
        errormsg = error
    }
    return res.json({
        error: false,
        message: 'logout successfull',
        errormsg: errormsg ? errormsg : null,
    })
}

exports.delete = async (req, res) => {
    let errormsg
    try {
        await WhatsAppInstances[req.query.key].instance?.sock?.logout()
        delete WhatsAppInstances[req.query.key]
    } catch (error) {
        errormsg = error
    }
    return res.json({
        error: false,
        message: 'Instance deleted successfully',
        data: errormsg ? errormsg : null,
    })
}
