const Controller = require('./controllers/server.controller');
const Config = require('../../../common/config/env.config');

const globalRoutePrefix = Config.globalRoutePrefix;
const routePrefix = "/server";

exports.routesConfig = function (app) {
    app.get(globalRoutePrefix + "/v1" + routePrefix + '/status/connection', [
        Controller.statusConnection
    ]);
};
