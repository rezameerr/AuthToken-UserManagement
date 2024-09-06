const Controller = require('./controllers/users.controller');
//const PermissionMiddleware = require('../../../common/middlewares/auth.permission.middleware');
//const ValidationMiddleware = require('../../../common/middlewares/auth.validation.middleware');
const AuthMgnt = require('../../../common/middlewares/auth.mgnt.middleware');
const Config = require('../../../common/config/env.config');

const globalRoutePrefix = Config.globalRoutePrefix;
const routePrefix = '';
const routeEntityName = '/users';

const ADMIN = Config.permissionLevels.ADMIN;
const NORMAL_USER = Config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
    app.post(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/send_verification_code', [
        Controller.sendVerificationCode
    ]);
    app.post(globalRoutePrefix + "/v1" + routePrefix + routeEntityName, [
        Controller.insert
    ]);
    app.get(globalRoutePrefix + "/v1" + routePrefix + routeEntityName, [
        /*
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),*/
        AuthMgnt.validAuthTokenNeeded,
        Controller.list
    ]);
    app.post(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/authentication', [
        Controller.authentication
    ]);
    app.get(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/:id', [
        /*
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,*/
        AuthMgnt.validAuthTokenNeeded,
        Controller.getById
    ]);
    app.patch(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/:id', [
        /*
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,*/
        AuthMgnt.validAuthTokenNeeded,
        Controller.patchById
    ]);
    app.patch(globalRoutePrefix + "/v1" + routePrefix + routeEntityName, [
        /*
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,*/
        AuthMgnt.validAuthTokenNeeded,
        Controller.patch
    ]);
    app.delete(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/:id', [
        /*
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),*/
        AuthMgnt.validAuthTokenNeeded,
        Controller.removeById
    ]);
    app.post(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/change_password' + '/:id', [
        //PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        AuthMgnt.validAuthTokenNeeded,
        Controller.changePasswordById
    ]);
    app.post(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/change_password', [
        AuthMgnt.validAuthTokenNeeded,
        Controller.changePassword
    ]);
    app.post(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/forgot_password', [
        Controller.forgotPassword
    ]);
    app.post(globalRoutePrefix + "/v1" + routePrefix + routeEntityName + '/need_captcha', [
        Controller.need_captcha
    ]);
};