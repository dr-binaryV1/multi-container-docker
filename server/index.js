const keys = require('./keys')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const Redis = require('ioredis')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const { Pool } = require('pg')
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
})

pgClient.on('error', () => console.log('Lost PG Connection'))

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});


const redisClient = new Redis({
  host: keys.redishHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})

redisClient.on('connect', () => console.log("Cache Ready"))

const redisPublisher = redisClient.duplicate()

app.get('/', (req, res) => {
  res.send('hi')
})

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values')
  res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
  const values = await redisClient.hgetall('values')
  res.send(values)
})

app.post('/values', async (req, res) => {
  const {index} = req.body

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high')
  }

  redisClient.hset('values', index, 'Nothing yet')
  await redisPublisher.publish('insert', index)
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

  res.send({ working: true })
})

app.listen(5000, err => {
  console.log('Listening...')
})