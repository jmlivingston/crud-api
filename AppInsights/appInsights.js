const appInsights = require('applicationinsights')
const { APP_INSIGHTS } = require('../CONSTANTS')

if (!appInsights.defaultClient) {
  appInsights.setup(APP_INSIGHTS.INSTRUMENTATION_KEY)
  appInsights
    .start()
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
}

module.exports = appInsights
