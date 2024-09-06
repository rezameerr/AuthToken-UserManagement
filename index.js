const config = require('./common/config/env.config.js');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const UsersRouter = require('./api/v1/users/users.routes.config');
const ServerRouter = require('./api/v1/server/server.routes.config');
const AppRouter = require('./api/v1/app/app.routes.config');
const CaptchaRouter = require('./api/v1/captcha/captcha.routes.config');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    } else {
        return next();
    }
});

app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

UsersRouter.routesConfig(app);
ServerRouter.routesConfig(app);
AppRouter.routesConfig(app);
CaptchaRouter.routesConfig(app);

app.listen(config.port, function () {
    console.log('AuthToken Web API is running on port: %s', config.port);
});
