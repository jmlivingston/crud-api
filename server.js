const fs = require('fs')
const jsonServer = require('json-server')
const killable = require('killable')
const nodeWatch = require('node-watch')
const path = require('path')
const { logError, logRequest } = require('./helpers')

const todos = JSON.parse(fs.readFileSync('./data/todos.json').toString())

const watch = process.argv.includes('watch')
const port = 4000
let httpServer = null

const getData = () => {
  const dataPath = path.join(__dirname, 'data')
  const files = fs.readdirSync(dataPath)
  return files.reduce((acc, file) => {
    const fileContents = fs.readFileSync(path.join(dataPath, file)).toString()
    let json = {}
    try {
      json[path.basename(file).replace('.json', '')] = JSON.parse(fileContents)
    } catch (error) {
      console.log(`Invalid JSON format in ${path.join(dataPath, file)}`)
    }
    return {
      ...acc,
      ...json,
    }
  }, {})
}

const todoData = getData()

const getId = (url) => {
  const numberString = url?.split('/')?.[2]
  return Number.parseInt(numberString)
}

const handleError = (request) => {
  let error = null
  const id = getId(request.url)
  if (!isNaN(id)) {
    const todo = todos.find((todo) => todo.id === id)
    if (todo?.name?.includes(`${request.method} CAUSES ERROR`)) {
      error = {
        status: 500,
        message: `Unable to ${request.method} this todo!`,
      }
    }
  }
  return error
}

const startServer = () => {
  const server = jsonServer.create()
  const middlewares = jsonServer.defaults()
  const router = jsonServer.router(todoData)
  server.use(middlewares)
  server.use(jsonServer.bodyParser)
  server.use((request, response, next) => {
    let error = null
    logRequest({ request, response })
    try {
      switch (request.method) {
        case 'DELETE':
          error = handleError(request)
          break
        case 'GET':
          error = handleError(request)
          break
        case 'POST':
          if (request.body.name.includes('CAUSES ERROR')) {
            error = {
              status: 500,
              message: `Unable to ${request.method} this todo!`,
            }
          }
          break
        case 'PUT':
          error = handleError(request)
          break
        default:
          break
      }
      if (error !== null) {
        throw error
      } else {
        next()
      }
    } catch (error) {
      logError({ error, request })
      response.status(error.status || 500).jsonp({
        error: {
          ...error,
          message: error.message,
        },
      })
    }
  })
  server.use(router)
  httpServer = server.listen(port, () => {
    console.log(`JSON Server is running on ${port}.`)
  })
  if (watch) {
    killable(httpServer)
  }
}

startServer()

if (watch) {
  nodeWatch('data', {}, () => {
    console.log(`JSON Server is restarting on ${port}.`)
    httpServer.kill(() => {
      startServer()
    })
  })
}
