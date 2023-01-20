const keys = require('./keys')
const redis = require('redis')

const redisClient = redis.createClient({
  url: keys.redisHost,
  retry_strategy: () => 1000
})

redisClient.on('connect', () => {
  console.log("Cache Ready")
})

const sub = redisClient.duplicate()

redisClient.connect()
sub.connect()

function fib(index) {
  if (index < 2) return 1
  return fib(index - 1) + fib(index - 2)
}

sub.subscribe('insert', (message) => {
  redisClient.hSet('values', message, fib(parseInt(message)))
})