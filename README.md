# crud-api

Basic REST endpoings for testing. Use with [crud-client](https://github.com/jmlivingston/crud-client).

## Instructions

1. `npm install`
2. Create a JSON file in data and add a valid JSON array. The name of the file will be the endpoint name.

> Note: If testing Microsoft Application Insights, be sure to create a .env with the following properties. See [Microsoft Azure - Create an Application Insights resource](https://learn.microsoft.com/en-us/azure/azure-monitor/app/create-new-resource).

- APP_INSIGHTS_INSTRUMENTATION_KEY=''
- APP_INSIGHTS_INSTANCE_NAME=''
- APP_INSIGHTS_RESOURCE_GROUP=''
- APP_INSIGHTS_SUBSCRIPTION_ID=''
- APP_INSIGHTS_TENANT_ID=''

## Commands

1. Start

`npm run start`

2. Start with watch will watch data folder for changes.

`npm run start-watch`

## Tweaking

Code is in server.js and can be augmented following the json-server documentation. The isAuthorized function can be used to tweak authorization rules.

## Tips

Check out [Mockaroo](https://mockaroo.com) for creating sample data.

## Packages

- [json-server](https://www.npmjs.com/package/json-server) - base for creating the API
- [node-watch](https://www.npmjs.com/package/node-watch) - watches changes to data folder
- [killable](https://www.npmjs.com/package/killable) - allows the server to be stopped reliably
