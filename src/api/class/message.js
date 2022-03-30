const { timestampToDatetime } = require('../helper/dateHelper')

class Message {
  
  constructor(message) {
    this.input = message;
    this.message = {
        id: null,
        name: '',
        text: '',
        timestamp: ''
    };
  }

  extract() {
    if (!this.input) return

    const { key: {remoteJid, id}, messageTimestamp, pushName, message: {conversation} } = this.input;
    this.message = {
        messageId: id,
        id: remoteJid,
        name: pushName,
        text: conversation,
        timestamp: timestampToDatetime(messageTimestamp)
    }

    return this.message
  }

}

exports.Message = Message