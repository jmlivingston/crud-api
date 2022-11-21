const { appInsightsClient } = require('./appInsights')
const path = require('path')
const fs = require('fs')
const { APP_INSIGHTS } = require('./CONSTANTS')

const todos = JSON.parse(fs.readFileSync('./data/todos.json').toString())

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

const getId = (url) => {
  const numberString = url?.split('/')?.[2]
  return Number.parseInt(numberString)
}

const handleError = (request) => {
  let error = null
  const id = getId(request.url)
  if (!isNaN(id)) {
    const todo = todos.find((todo) => todo.id === id)
    if (todo?.name?.includes(`${request.method} ERROR`)) {
      error = {
        status: 500,
        message: `Unable to ${request.method} this todo!`,
      }
    }
  }
  return error
}

const logEvent = ({ error, request, response }) => {
  console.log({
    sessionId: request.headers.appinsightscontextsessionid,
    requestId: request.headers.appinsightspropertiesrequestid,
  })
  appInsightsClient.context.tags['ai.session.id'] =
    request.headers.appinsightscontextsessionid
  appInsightsClient.trackEvent({
    name: APP_INSIGHTS.LOG_NAME,
    properties: {
      advisoryCode: 9999, // TODO
      environment: 'DEV', // TODO
      error,
      request: {
        resource: request.url,
        options: { body: request.body, headers: request.headers },
      },
      requestId: request.headers.appinsightspropertiesrequestid,
      response,
    },
  })
}

module.exports = { getData, getId, handleError, logEvent }
