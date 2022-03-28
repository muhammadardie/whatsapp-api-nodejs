require('dotenv').config()

let config = module.exports

config.express = {
  port: process.env.PORT || 3000,
  ip: 'localhost'
}

config.webhook = {
  url: process.env.WEBHOOK_URL
}