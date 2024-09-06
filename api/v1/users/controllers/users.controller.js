const Model = require("../models/users.model");
const VerificationCodeModel = require("../models/verification_codes.model");
const Config = require('../../../../common/config/env.config');
const crypto = require("crypto");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const libphonenumberJs = require("libphonenumber-js");
const clm = require('country-locale-map');
const getSymbolFromCurrency = require('currency-symbol-map');

const Utils = require("../../../../common/middlewares/utils.middleware");
const SecurityUtils = require("../../../../common/middlewares/sec.middleware");
const AuthMgnt = require("../../../../common/middlewares/auth.mgnt.middleware");
const { json } = require("express");

const ADMIN = Config.permissionLevels.ADMIN;
const NORMAL_USER = Config.permissionLevels.NORMAL_USER;

exports.sendVerificationCode = async (req, res) => {
    try {
        if (
            Utils.isUndefinedOrEmptyOrSpace(req.body.mobile_number)
        ) {
            return res.status(400).send();
        }

        try{
            let userTemp = await Model.findByMobileNumber(req.body.mobile_number);
            if (userTemp !== null && userTemp.length > 0) {
                res.status(400).send({error: "Mobile number exists"});
                return;
            }
        } catch (ex2) {

        }

        let retCode = -1;
        //let vCode = SecurityUtils.secureRandomNumeric(4);
        let vCode = "1234";
        let notValidBefore = Utils.getUTCDateTimestamp(0, 0, 0);
        let expireAfter = Utils.getUTCDateTimestamp(0, 0, 5, 0); // verification code is valid for 5 minutes
        
        let uuid = uuidv4();

        const data = {
            uuid: uuid,
            mobile_number: req.body.mobile_number,
            verification_code: vCode,
            not_valid_before: notValidBefore,
            expire_after: expireAfter,
            doc_ver: "1.0",
        };

        try {
            let successfulVCodeSMSSent = false;

            //------------------------------------------
            //
            // Implement sending verification code via SMS with your SMS gateway provider
            // Also implement sms sending policies, e.g. 120 seconds between each new code request, 
            //      limit how many sms should be sent for each mobile number in a time period, showing a captcha to user, etc.
            //
            //------------------------------------------

            //-----------------------
            //
            // Checking SMS sending policies here and decide whether to send it or return an error
            //
            //-----------------------

            //-----------------------
            //
            // Sending SMS via your gateway...
            //
            //-----------------------

            successfulVCodeSMSSent = true; // Suppose it was sent successfully

            if (successfulVCodeSMSSent == true) {
                let lastVCodeSent = await VerificationCodeModel.findByMobileNumber(req.body.mobile_number);
                if (lastVCodeSent !== null && lastVCodeSent.length > 0) {
                    data.uuid = lastVCodeSent[0].uuid;
                    await VerificationCodeModel.update(lastVCodeSent[0]._id, data).then((result) => {    
                        retCode = 0;
                    });
                } else {
                    await VerificationCodeModel.create(data).then((result) => {    
                        retCode = 0;
                    });
                }
            } else {
                retCode = -2;
                return res.status(400).send({ error: "Couldn't send SMS"});
            }

        } catch (ex_sms) {
            retCode = -2;
            return res.status(400).send({ error: "Couldn't send SMS: " + ex_sms});
        }

        return res.status(200).send(retCode.toString());
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!: " + ex});
    }
};

exports.insert = async (req, res) => {
    try {
        if (
            Utils.isUndefinedOrEmptyOrSpace(req.body.mobile_number) ||
            Utils.isUndefinedOrEmptyOrSpace(req.body.password) ||
            Utils.isUndefinedOrEmptyOrSpace(req.body.verification_code)
        ) {
            return res.status(400).send();
        }

        try{
            let userTemp = await Model.findByMobileNumber(req.body.mobile_number);
            if (userTemp !== null && userTemp.length > 0) {
                res.status(400).send({error: "Mobile number exists"});
                return;
            }
        } catch (ex2) {

        }

        let lastVCodeSent = null;

        try {
            lastVCodeSent = await VerificationCodeModel.findByMobileNumber(req.body.mobile_number);
            if (lastVCodeSent === null || lastVCodeSent.length == 0) {
                res.status(400).send({error: "Verification code doesn't exist"});
                return;
            }
        } catch (ex_vcode) {
            res.status(400).send({error: "Verification code doesn't exist"});
            return;
        }

        if (req.body.verification_code !== lastVCodeSent[0].verification_code) {
            res.status(403).send({error: "Invalid verification code"});
            return;
        }

        let nowDT = new Date();
        let notValidBefore = Utils.parseUTCDateTimestamp(lastVCodeSent[0].not_valid_before);
        let expireAfter = Utils.parseUTCDateTimestamp(lastVCodeSent[0].expire_after);

        if (nowDT < notValidBefore || nowDT > expireAfter) {
            res.status(403).send({error: "Expired verification code"});
            return;
        }

        let mobile_number_country_calling_code = null;
        let local_mobile_number = null;
        let country = 'US';
        let country_name = 'United States';
        let country_code = '840';
        let locale = 'en_US';
        let language = 'en';
        let currency = 'USD';
        let currency_code = '840';
        let currency_symbol = '$';

        const phoneNumber = libphonenumberJs.parsePhoneNumberFromString(req.body.mobile_number);

        try {
            mobile_number_country_calling_code = phoneNumber.countryCallingCode;
        } catch (error) {
            
        }
        if (Utils.isUndefinedOrEmptyOrSpace(mobile_number_country_calling_code)) {
            mobile_number_country_calling_code = null;
        }

        try {
            local_mobile_number = phoneNumber.nationalNumber;
        } catch (error) {
            
        }
        if (Utils.isUndefinedOrEmptyOrSpace(local_mobile_number)) {
            local_mobile_number = null;
        }

        try {
            country = phoneNumber.country;
        } catch (error) {
            
        }
        if (Utils.isUndefinedOrEmptyOrSpace(country)) {
            country = 'US';
        }

        try {
            country_name = clm.getCountryNameByAlpha2(country);
        } catch (error) {
            
        }
        if (Utils.isUndefinedOrEmptyOrSpace(country)) {
            country = 'United States';
        }

        try {
            country_code = clm.getNumericByAlpha2(country);
        } catch (error) {
            
        }
        if (Utils.isUndefinedOrEmptyOrSpace(country_code)) {
            country_code = '840';
        }

        try {
            locale = clm.getCountryByAlpha2(country)['default_locale'];
        } catch (error) {
            
        }
        if (Utils.isUndefinedOrEmptyOrSpace(locale)) {
            locale = 'en_US';
        }

        language = clm.getCountryByAlpha2(country)['languages'][0];
        if (Utils.isUndefinedOrEmptyOrSpace(language)) {
            language = 'en';
        }

        try {
            currency = clm.getCurrencyByAlpha2(country);
        } catch (error) {
            
        }
        if (Utils.isUndefinedOrEmptyOrSpace(currency)) {
            language = 'USD';
        }

        try {
            currency_code = country_code;
        } catch (error) {
            
        }
        if (Utils.isUndefinedOrEmptyOrSpace(currency_code)) {
            currency_code = '840';
        }

        try {
            currency_symbol = getSymbolFromCurrency(currency);
        } catch (error) {
            
        }
        if (Utils.isUndefinedOrEmptyOrSpace(currency_symbol)) {
            currency_symbol = '$';
        }

        let salt = crypto.randomBytes(64).toString("base64");
        let hash = SecurityUtils.getSHA512(salt + req.body.password);
        let uuid = uuidv4();
        let creation_timestamp = Utils.getUTCDateTimestamp(0, 0, 0, 0);

        const data = {
            uuid: uuid,
            user_type: NORMAL_USER,
            //username: req.body.username,  --> If you want seperate username from mobile number, uncomment it and implement here
            username: req.body.mobile_number,
            mobile_number: req.body.mobile_number,
            mobile_number_country_calling_code: mobile_number_country_calling_code,
            local_mobile_number: local_mobile_number,
            //country: req.body.signup_country,
            //country_name: req.body.signup_country,
            //country_code: req.body.signup_country_code,
            country: country,
            country_name: country_name,
            country_code: country_code,
            locale: locale,
            language: language,
            email: req.body.email,
            salt: salt,
            password_hash: hash,
            name: req.body.name,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            creation_timestamp: creation_timestamp,
            last_update_timestamp: null,
            password_change_required: 0,
            is_active: 1,
            is_deleted: 0,
            doc_ver: "1.0",
        };

        let id = null;
        await Model.create(data).then((result) => {    
                id = result._id
        });

        await VerificationCodeModel.removeByMobileNumber(req.body.mobile_number);
        
        return res.status(200).send(id);
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.list = async (req, res) => {
    try {
        let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query) {
            if (req.query.page) {
                req.query.page = parseInt(req.query.page);
                page = Number.isInteger(req.query.page) ? req.query.page : 0;
            }
        }

        var itemsList = await Model.list(limit, page);

        itemsList = itemsList.filter((item) => item.is_deleted == 0 && item.is_active == 1);

        itemsList.forEach((element) => {
            element.id = element._id;
            delete element._id;
            delete element.__v;
            delete element.salt;
            delete element.password_hash;
        });

        return res.status(200).send(itemsList);
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.getById = async (req, res) => {
    try {
        let userID = null;

        if (req.params == null || req.params.id == null || req.params.id.toString().toLowerCase() == 'null') {
            let authTokenObj = AuthMgnt.getAuthTokenObj(req.headers['authorization']);
            userID = authTokenObj.userID
        } else {
            userID = req.params.id;
        }

        let item = await Model.findById(userID);
        if (item.is_deleted == 1 || item.is_active == 0) {
            return res.status(400).send();
        }

        delete item.salt;
        delete item.password_hash;

        return res.status(200).send(item);
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.changePasswordById = async (req, res) => {
    try {
        let item = await Model.findById(req.params.id);
        if (item.is_deleted == 1 || item.is_active == 0) {
            return res.status(400).send();
        }

        let last_update_timestamp = Utils.getUTCDateTimestamp(0, 0, 0, 0);
        let salt = crypto.randomBytes(64).toString("base64");
        let hash = crypto
            .createHash("sha512")
            .update(salt + req.body.new_password)
            .digest("base64");

        const updateData = {
            salt: salt,
            password_hash: hash,
            last_update_timestamp: last_update_timestamp,
        };

        await Model.update(req.params.id, updateData);

        return res.status(200).send({ id: req.params.id });
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        let authTokenObj = AuthMgnt.getAuthTokenObj(req.headers['authorization']);
        
        let item = await Model.findById(authTokenObj.userID);
        if (item.is_deleted == 1 || item.is_active == 0) {
            return res.status(400).send();
        }

        let last_update_timestamp = Utils.getUTCDateTimestamp(0, 0, 0, 0);
        let salt = crypto.randomBytes(64).toString("base64");
        let hash = crypto
            .createHash("sha512")
            .update(salt + req.body.new_password)
            .digest("base64");

        const updateData = {
            salt: salt,
            password_hash: hash,
            last_update_timestamp: last_update_timestamp,
        };

        await Model.update(authTokenObj.userID, updateData);

        return res.status(200).send({ id: authTokenObj.userID });
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.updateById = async (req, res) => {
    try {
        let item = await Model.findById(req.params.id);
        if (item.is_deleted == 1 || item.is_active == 0) {
            return res.status(400).send();
        }

        let last_update_timestamp = Utils.getUTCDateTimestamp(0, 0, 0, 0);

        const updateData = {
            username: req.body.username,
            name: req.body.name,
            //firstname: req.body.firstname,
            //lastname: req.body.lastname,
            email: req.body.email,
            last_update_timestamp: last_update_timestamp,
        };

        await Model.update(req.params.id, updateData);

        return res.status(200).send({ id: req.params.id });
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.patchById = async (req, res) => {
    try {
        let item = await Model.findById(req.params.id);
        if (item.is_deleted == 1 || item.is_active == 0) {
            return res.status(400).send();
        }

        let last_update_timestamp = Utils.getUTCDateTimestamp(0, 0, 0, 0);

        if (req.body.new_password) {
            let salt = crypto.randomBytes(64).toString("base64");
            let hash = crypto
                .createHash("sha512")
                .update(salt + req.body.new_password)
                .digest("base64");

            const updateData = {
                salt: salt,
                password_hash: hash,
                username: req.body.username,
                name: req.body.name,
                //firstname: req.body.firstname,
                //lastname: req.body.lastname,
                email: req.body.email,
                last_update_timestamp: last_update_timestamp,
            };

            await Model.update(req.params.id, updateData);

            return res.status(200).send();
        } else {
            const updateData = {
                username: req.body.username,
                name: req.body.name,
                //firstname: req.body.firstname,
                //lastname: req.body.lastname,
                email: req.body.email,
                last_update_timestamp: last_update_timestamp,
            };

            await Model.update(req.params.id, updateData);

            return res.status(200).send();
        }
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.update = async (req, res) => {
    try {
        let authTokenObj = AuthMgnt.getAuthTokenObj(req.headers['authorization']);

        let item = await Model.findById(authTokenObj.userID);
        if (item.is_deleted == 1 || item.is_active == 0) {
            return res.status(400).send();
        }

        let last_update_timestamp = Utils.getUTCDateTimestamp(0, 0, 0, 0);

        const updateData = {
            username: req.body.username,
            name: req.body.name,
            //firstname: req.body.firstname,
            //lastname: req.body.lastname,
            email: req.body.email,
            last_update_timestamp: last_update_timestamp,
        };

        await Model.update(authTokenObj.userID, updateData);

        return res.status(200).send({ id: authTokenObj.userID });
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.patch = async (req, res) => {
    try {
        let authTokenObj = AuthMgnt.getAuthTokenObj(req.headers['authorization']);

        let item = await Model.findById(authTokenObj.userID);
        if (item.is_deleted == 1 || item.is_active == 0) {
            return res.status(400).send();
        }

        let last_update_timestamp = Utils.getUTCDateTimestamp(0, 0, 0, 0);

        if (req.body.new_password) {
            let salt = crypto.randomBytes(64).toString("base64");
            let hash = crypto
                .createHash("sha512")
                .update(salt + req.body.new_password)
                .digest("base64");

            const updateData = {
                salt: salt,
                password_hash: hash,
                username: req.body.username,
                name: req.body.name,
                //firstname: req.body.firstname,
                //lastname: req.body.lastname,
                email: req.body.email,
                last_update_timestamp: last_update_timestamp,
            };

            await Model.update(authTokenObj.userID, updateData);

            return res.status(200).send();
        } else {
            const updateData = {
                username: req.body.username,
                name: req.body.name,
                //firstname: req.body.firstname,
                //lastname: req.body.lastname,
                email: req.body.email,
                last_update_timestamp: last_update_timestamp,
            };

            await Model.update(authTokenObj.userID, updateData);

            return res.status(200).send();
        }
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.removeById = async (req, res) => {
    try {
        let item = await Model.findById(req.params.id);
        if (item.is_deleted == 1 || item.is_active == 0) {
            return res.status(400).send();
        }

        let last_update_timestamp = Utils.getUTCDateTimestamp(0, 0, 0, 0);

        //await Model.removeById(req.params.id);

        const updateData = {
            is_active: 0,
            is_deleted: 1,
            last_update_timestamp: last_update_timestamp,
        };

        await Model.update(req.params.id, updateData);

        return res.status(200).send({ id: req.params.id });
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.authentication = async (req, res) => {
    try {
        if (
            Utils.isUndefinedOrEmptyOrSpace(req.body.username) ||
            Utils.isUndefinedOrEmptyOrSpace(req.body.password)
        ) {
            return res.status(403).send({
                error: "Invalid username or password.",
            });
        }

        let user = null;
        user = await Model.find(req.body.username); // username value in the request can be mobile number, username, email
       
        if (user === null || user.length == 0) {
            return res.status(403).send({
                error: "Invalid username or password.",
            });
        }

        let password_hash = user[0].password_hash;
        let salt = user[0].salt;
        let hash = SecurityUtils.getSHA512(salt + req.body.password);

        if (hash === password_hash) {
            password_hash = salt = hash = null;

            let authToken = AuthMgnt.generateAuthToken(
                user[0]._id,
                user[0].uuid,
                Utils.getUTCDateTimestamp(0, 0, 0),
                Utils.getUTCDateTimestamp(365, 0, 0, 0)
            );

            user = null;
            return res.status(200).send({
                authToken: authToken,
            });
        } else {
            password_hash = salt = hash = null;
            user = null;
            return res.status(403).send({
                error: "Invalid username or password.",
            });
        }
    } catch (ex) {
        return res.status(403).send({
            error: "Invalid username or password.",
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        if (Utils.isUndefinedOrEmptyOrSpace(req.body.username)) {
            return res.status(403).send({
                error: 'Invalid username.'
            });
        }

        let user = null;
        user = await Model.find(req.body.username);
        
        if (user === null || user.length <= 0) {
            return res.status(403).send({
                error: 'Invalid username.'
            });
        }

        let newPassword = "123456";
        //------------------------------------
        // Sending temporary random pass via sms or email or etc
        // Implement your own policy here
        //
        //
        //
        //
        //-------------------------------------

        let salt = crypto.randomBytes(64).toString('base64');
        let hash = crypto.createHash('sha512').update(salt + newPassword).digest("base64");

        let last_update_timestamp = Utils.getUTCDateTimestamp(0, 0, 0, 0);

        const updateData = {
            salt: salt,
            password_hash: hash,
            last_update_timestamp: last_update_timestamp
        };

        await Model.update(user[0].id, updateData);

        res.status(200).send();
    } catch (ex) {
        return res.status(403).send({
            error: 'Invalid username.'
        });
    }
};

exports.need_captcha = async (req, res) => {};