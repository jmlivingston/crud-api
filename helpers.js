const { appInsightsClient } = require('./appInsights')

const logError = ({ error, request }) => {
  appInsightsClient.trackException({ exception: { error, request } })
}

const logRequest = ({ request, response }) => {
  appInsightsClient.trackRequest({ request, response })
}

module.exports = { logError, logRequest }
