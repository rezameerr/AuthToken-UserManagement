const Controller = require('./controllers/captcha.controller');
//const PermissionMiddleware = require('../../../common/middlewares/auth.permission.middleware');
//const ValidationMiddleware = require('../../../common/middlewares/auth.validation.middleware');
const Config = require('../../../common/config/env.config');

const globalRoutePrefix = Config.globalRoutePrefix;
const routePrefix = '';
const routeEntityName = '/captcha';

const ADMIN = Config.permissionLevels.ADMIN;
const NORMAL_USER = Config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
    app.post(globalRoutePrefix + '/v1' + routePrefix + routeEntityName, [
        Controller.verify
    ]);
    app.get(globalRoutePrefix + '/v1' + routePrefix + routeEntityName, [
        /*
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),*/
        Controller.get
    ]);
};