const appInsights = require('applicationinsights')

const init = ({ instrumentationKey }) => {
  appInsights.setup(instrumentationKey)
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

module.exports = { appInsights, init }
