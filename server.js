const jsonServer = require('json-server')
const killable = require('killable')
const nodeWatch = require('node-watch')
const { getData, handleError, logEvent } = require('./helpers')
const { getAppInsightsQueryUrl } = require('./appInsights')
const { APP_INSIGHTS } = require('./CONSTANTS')

const watch = process.argv.includes('watch')
const port = 4000
let httpServer = null

const startServer = () => {
  const server = jsonServer.create()
  const middlewares = jsonServer.defaults()
  const router = jsonServer.router(getData())
  router.render = (request, response) => {
    logEvent({ request, response: response.locals.data })
    response.jsonp(response.locals.data)
  }
  server.use(middlewares)
  server.use(jsonServer.bodyParser)
  server.use((request, response, next) => {
    let error = null
    try {
      switch (request.method) {
        case 'DELETE':
          error = handleError(request)
          break
        case 'GET':
          error = handleError(request)
          break
        case 'POST':
          if (request.body.name.includes('ERROR')) {
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
      logEvent({ error, request })
      response.status(error.status || 500).jsonp({
        error: {
          ...error,
          appInsights: {
            message: 'Azure API Log',
            url: getAppInsightsQueryUrl({
              name: APP_INSIGHTS.QUERIES.REQUEST_BY_SESSION_ID_REQUEST_ID,
              requestId: request.headers.appinsightspropertiesrequestid,
              sessionId: request.headers.appinsightscontextsessionid,
            }),
          },
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
