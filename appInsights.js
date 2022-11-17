const appInsights = require('applicationinsights')

if (!appInsights.defaultClient) {
  appInsights.setup(process.env.APP_INSIGHTS_INSTRUMENTATION_KEY)
  appInsights
    .start()
    .setAutoDependencyCorrelation(false)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(false)
    .setAutoCollectDependencies(false)
    .setAutoCollectConsole(false)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
}

appInsights.defaultClient.addTelemetryProcessor((envelope, context) => {
  if (context?.['http.ServerResponse']?.locals?.data) {
    envelope.tags['ai.session.id'] =
      context?.['http.ServerRequest']?.headers?.appinsightssessionid ||
      envelope.tags['ai.session.id']
    envelope.data.baseData.properties = {
      ...envelope.data.baseData.properties,
      request: context?.['http.ServerRequest']?.body
        ? { body: context?.['http.ServerRequest']?.body }
        : undefined,
      response: context['http.ServerResponse'].locals.data,
    }
  }
  return true
})

module.exports = { appInsightsClient: appInsights.defaultClient }
