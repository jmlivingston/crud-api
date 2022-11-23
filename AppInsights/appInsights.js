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

const getAppInsightsQueryUrl = ({ name, requestId, sessionId }) => {
  const getQueryByName = ({ name, requestId, sessionId }) => {
    let query
    switch (name) {
      case APP_INSIGHTS.QUERIES.REQUEST_BY_SESSION_ID_REQUEST_ID:
        query = `customEvents | where session_Id == "${sessionId}" and name == "${APP_INSIGHTS.LOG_NAME}" and customDimensions["requestId"] == "${requestId}"`
        break
    }
    return query
  }

  const query = getQueryByName({ name, requestId, sessionId })
  const url = `https://portal.azure.com/#@${
    APP_INSIGHTS.TENANT_ID
  }/blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2F${
    APP_INSIGHTS.SUBSCRIPTION_ID
  }%2FresourceGroups%2F${
    APP_INSIGHTS.RESOURCE_GROUP
  }%2Fproviders%2Fmicrosoft.insights%2Fcomponents%2F${
    APP_INSIGHTS.INSTANCE_NAME
  }/source/LogsBlade.AnalyticsShareLinkToQuery/query/${encodeURI(
    query
  )}/timespan/TIMESPAN`
  return url
}

module.exports = {
  appInsightsClient: appInsights.defaultClient,
  getAppInsightsQueryUrl,
}
