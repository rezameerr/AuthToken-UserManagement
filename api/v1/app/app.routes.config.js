const Controller = require('./controllers/app.controller');
//const PermissionMiddleware = require('../../../common/middlewares/auth.permission.middleware');
//const ValidationMiddleware = require('../../../common/middlewares/auth.validation.middleware');
const Config = require('../../../common/config/env.config');

const globalRoutePrefix = Config.globalRoutePrefix;
const routePrefix = "";
const routeEntityName = "/app";

const ADMIN = Config.permissionLevels.ADMIN;
const NORMAL_USER = Config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
    app.get(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/settings', [
        Controller.settings
    ]);
    app.get(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/latest_version', [
        Controller.latest_version
    ]);
    app.get(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/terms', [
        Controller.terms
    ]);
    app.get(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/privacy', [
        Controller.privacy
    ]);
    app.get(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/about', [
        Controller.about
    ]);
    app.get(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/contact_info', [
        Controller.contact_info
    ]);
    app.get(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/timestamp', [
        Controller.timestamp
    ]);
};
