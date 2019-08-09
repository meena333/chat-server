const express = require('express')
const Sse = require('json-sse')
const bodyparser = require('body-parser')
const cors = require('cors');
const Sequelize = require('sequelize')

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/postgres';
const db = new Sequelize(databaseUrl)

db.sync({ force: false })
  .then(() => console.log('Db synced'))

const Message = db.define('message', {
  text: Sequelize.STRING,
  user: Sequelize.STRING
})

//const messages = ['hello world']

//serialize the messages data into string
//const data = JSON.stringify(messages)

const stream = new Sse()

const app = express()
const jsonParser = bodyparser.json()
const corsMiddlware = cors()

app.use(corsMiddlware)
app.use(jsonParser)


app.get('/stream', async (req, res) => {
  const messages = await Message.findAll()

  const data = JSON.stringify(messages)
  stream.updateInit(data)

  stream.init(req, res)
})

app.get('/stream', stream.init)
app.post('/message', async (req, res) => {
  const { message, user } = req.body
  //messages.push(message)

  const entity = await Message.create({ text: message, user })
  const messages = await Message.findAll()

  const data = JSON.stringify(messages)
  //init for the new clients
  stream.updateInit(data)

  //broadcast all the messages to all clients
  stream.send(data)
  res.send(entity)
})


const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Listening on port ${port}..`))