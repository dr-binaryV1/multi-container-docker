const keys = require('./keys')
const Redis = require('ioredis')

const redisClient = new Redis({
  host: keys.redisHost,
  port: keys.redisPort
})

redisClient.on('connect', () => {
  console.log("Cache Ready")
})

const sub = redisClient.duplicate()

function fib(index) {
  if (index < 2) return 1
  return fib(index - 1) + fib(index - 2)
}

sub.on("message", (channel, message) => {
  redisClient.hset('values', message, fib(parseInt(message)))
});

sub.subscribe('insert', (error, message) => {
  if (error) {
    console.log(error)
  }
})