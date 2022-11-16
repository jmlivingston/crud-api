const appInsights = require('applicationinsights')

if (!appInsights.defaultClient) {
  appInsights.setup(process.env.APP_INSIGHTS_INSTRUMENTATION_KEY)
  appInsights.start()
}

module.exports = { appInsightsClient: appInsights.defaultClient }
