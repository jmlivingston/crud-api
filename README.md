# JSON API

## Instructions

1. `npm install`
2. Create a JSON file in data and add a valid JSON array. The name of the file will be the endpoint name.

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
