const jsonServer = require('json-server')
const killable = require('killable')
const nodeWatch = require('node-watch')
const { getData, handleError } = require('./helpers')
const { APP_INSIGHTS, ENVIRONMENT } = require('./CONSTANTS')
const {
  getLogUrl,
  handleTelemetry,
  HEADERS,
} = require('./AppInsights/appInsightsHelper')
const appInsights = require('./AppInsights/appInsights')

const watch = process.argv.includes('watch')
const port = 4000
let httpServer = null

const wrapHandleTelemetry = ({ request, response }) => {
  const url =
    request.protocol + '://' + request.get('host') + request.originalUrl
  handleTelemetry({
    appInsights,
    appInsightsConfig: APP_INSIGHTS,
    environment: ENVIRONMENT,
    logToConsole: false,
    options: { method: request.method },
    requestId: request.headers.appinsightspropertiesrequestid,
    resource: url,
    response: {
      json: () => Promise.resolve(response?.locals?.data),
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url,
    },
    sessionId: request.headers.appinsightscontextsessionid,
    tier: 'API',
  })
}

const startServer = () => {
  const server = jsonServer.create()
  const middlewares = jsonServer.defaults()
  const router = jsonServer.router(getData())
  router.render = (request, response) => {
    wrapHandleTelemetry({
      request,
      response: { ...response, ok: true, status: 200, statusText: 'OK' },
    })
    response.send(response.locals.data)
  }
  server.use(middlewares)
  server.use(jsonServer.bodyParser)
  server.use((request, response, next) => {
    const logUrl = getLogUrl({
      appInsightsConfig: APP_INSIGHTS,
      requestId: request.headers.appinsightspropertiesrequestid,
      sessionId: request.headers.appinsightscontextsessionid,
    })
    response.header('Access-Control-Expose-Headers', HEADERS.LOG_URL)
    response.header(HEADERS.LOG_URL, logUrl)
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
      wrapHandleTelemetry({
        response: {
          ...error,
          ok: false,
          status: error.status || 500,
          statusText: 'Internal Server Error',
        },
        request,
      })
      response.status(error.status || 500).jsonp({
        error: {
          ...error,
          appInsights: {
            message: 'Azure API Log',
            url: logUrl,
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
