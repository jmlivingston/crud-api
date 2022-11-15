const fs = require('fs')
const jsonServer = require('json-server')
const killable = require('killable')
const nodeWatch = require('node-watch')
const path = require('path')

const posts = JSON.parse(fs.readFileSync('./data/posts.json').toString())

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

const postData = getData()

const getId = (url) => {
  const numberString = url?.split('/')?.[2]
  return Number.parseInt(numberString)
}

const handleError = (req) => {
  let error = null
  const id = getId(req.url)
  if (!isNaN(id)) {
    const post = posts.find((post) => post.id === id)
    if (post.name.includes(`${req.method} CAUSES ERROR`)) {
      error = {
        status: 500,
        message: `Unable to ${req.method} this item!`,
      }
    }
  }
  return error
}

const startServer = () => {
  const server = jsonServer.create()
  const middlewares = jsonServer.defaults()
  const router = jsonServer.router(postData)
  server.use([...middlewares])
  server.use(jsonServer.bodyParser)
  server.use((req, res, next) => {
    try {
      switch (req.method) {
        case 'DELETE':
          error = handleError(req)
          break
        case 'GET':
          error = handleError(req)
          break
        case 'POST':
          if (req.body.name.includes('CAUSES ERROR')) {
            error = {
              status: 500,
              message: `Unable to ${req.method} this item!`,
            }
          }
          break
        case 'PUT':
          error = handleError(req)
          break
        default:
          break
      }
      if (error !== null) {
        res.status(error.status).jsonp({
          error: error.message,
        })
      } else {
        next()
      }
    } catch (error) {
      res.status(500).jsonp({
        error,
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
