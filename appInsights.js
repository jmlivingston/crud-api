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

  appInsights.defaultClient.addTelemetryProcessor((envelope, context) => {
    if (context?.['http.ServerResponse']?.locals?.data) {
      envelope.tags['ai.session.id'] =
        context?.['http.ServerRequest']?.headers?.appinsightscontextsessionid ||
        envelope.tags['ai.session.id']
      envelope.data.baseData.properties = {
        ...envelope.data.baseData.properties,
        advisoryCode: 9999, // TODO
        environment: 'DEV', // TODO
        name: 'TODOS', // TODO
        request: context?.['http.ServerRequest']?.body
          ? {
              body: context?.['http.ServerRequest']?.body,
              method: context?.['http.ServerRequest']?.method,
            }
          : undefined,
        requestId:
          context?.['http.ServerRequest']?.headers
            ?.appinsightspropertiesrequestid,
        response: context['http.ServerResponse'].locals.data,
      }
    }
    return true
  })
}

module.exports = { appInsightsClient: appInsights.defaultClient }
