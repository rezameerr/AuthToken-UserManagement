"use strict";

const authTokenHMACKey = require("../config/env.config.js").authTokenHMACKey;
const authTokenSymKey256 = require("../config/env.config.js").authTokenSymKey256;
const authTokenIV16 = require("../config/env.config.js").authTokenIV16;

const SecurityUtils = require("./sec.middleware");
const Utils = require("./utils.middleware");

module.exports = class AuthMgnt {
    constructor() {}

    static validatePassword(username, password) {}

    static generateAuthToken(
        userID,
        userUUID,
        notValidBefore,
        expireAfter /*, string userHostIP, string userHostName*/
    ) {
        try {
            const nonce = SecurityUtils.secureRandom(64);
            const msg = nonce + "," + userID + "," + userUUID + "," + notValidBefore + "," + expireAfter; //+ "," + userHostIP + "," + userHostName;

            const auth = SecurityUtils.getHMAC(msg, authTokenHMACKey);

            const authToken = {
                nonce: nonce,
                userID: userID,
                userUUID: userUUID,
                notValidBefore: notValidBefore,
                expireAfter: expireAfter,
                //userHostIP: userHostIP,
                //userHostName: userHostName,
                auth: auth,
            };

            const jsonAuthToken = JSON.stringify(authToken);

            const encryptedAuthToken = SecurityUtils.encrypt(
                jsonAuthToken,
                authTokenSymKey256,
                authTokenIV16
            );

            return encryptedAuthToken;
        } catch (ex) {
            return null;
        }
    }

    static slideAuthTokenExpiration(authToken, expireAfter) {
        try {
            const authTokenObj = this.getAuthTokenObj(authToken);

            if (authTokenObj === null) {
                return null;
            }

            const nonce = SecurityUtils.secureRandom(64);
            const msg =
                nonce +
                "," +
                authTokenObj.userID +
                "," +
                authTokenObj.userUUID +
                "," +
                authTokenObj.notValidBefore +
                "," +
                expireAfter;
            //+ "," + authTokenObj.userHostIP + "," + authTokenObj.userHostName;

            const auth = SecurityUtils.getHMAC(msg, authTokenHMACKey);

            const authTokenNew = {
                nonce: nonce,
                userID: authTokenObj.userID,
                userUUID: authTokenObj.userUUID,
                notValidBefore: authTokenObj.notValidBefore,
                expireAfter: expireAfter,
                //userHostIP: authTokenObj.userHostIP,
                //userHostName: authTokenObj.userHostName,
                auth: auth,
            };

            const jsonAuthToken = JSON.stringify(authTokenNew);

            const encryptedAuthToken = SecurityUtils.encrypt(
                jsonAuthToken,
                authTokenSymKey256,
                authTokenIV16
            );

            return encryptedAuthToken;
        } catch (ex) {
            return null;
        }
    }

    static getAuthTokenObj(authToken) {
        try {
            const decryptedAuthToken = SecurityUtils.decrypt(
                authToken,
                authTokenSymKey256,
                authTokenIV16
            );

            return JSON.parse(decryptedAuthToken);
        } catch (ex) {
            return null;
        }
    }

    static validateAuthToken(authToken /*, userHostIP, userHostName*/) {
        try {
            const authTokenObj = this.getAuthTokenObj(authToken);

            if (authTokenObj === null) {
                return false;
            }

            if (
                Utils.isUndefinedOrEmptyOrSpace(authTokenObj.nonce) ||
                Utils.isUndefinedOrEmptyOrSpace(authTokenObj.userID) ||
                Utils.isUndefinedOrEmptyOrSpace(authTokenObj.userUUID) ||
                Utils.isUndefinedOrEmptyOrSpace(authTokenObj.notValidBefore) ||
                Utils.isUndefinedOrEmptyOrSpace(
                    authTokenObj.expireAfter
                ) /* || Utils.isUndefinedOrEmptyOrSpace(authTokenObj.userHostIP) || 
                    Utils.isUndefinedOrEmptyOrSpace(authTokenObj.userHostName)*/
            ) {
                return false;
            }

            const msg =
                authTokenObj.nonce +
                "," +
                authTokenObj.userID +
                "," +
                authTokenObj.userUUID +
                "," +
                authTokenObj.notValidBefore +
                "," +
                authTokenObj.expireAfter; //+ "," + authTokenObj.userHostIP + "," + authTokenObj.userHostName;

            const auth = SecurityUtils.getHMAC(msg, authTokenHMACKey);

            if (authTokenObj.auth != auth) {
                return false;
            }

            /*
                if (authTokenObj.userHostIP != userHostIP)
                {
                    return false;
                }

                if (authTokenObj.userHostName != userHostName)
                {
                    return false;
                }
            */

            let nowDT = new Date();
            let notValidBefore = Utils.parseUTCDateTimestamp(authTokenObj.notValidBefore);
            let expireAfter = Utils.parseUTCDateTimestamp(authTokenObj.expireAfter);

            if (nowDT < notValidBefore || nowDT > expireAfter) {
                return false;
            }

            return true;
        } catch (ex) {
            console.log(ex);
            return false;
        }
    }

    static validAuthTokenNeeded = (req, res, next) => {
        try {
            if (req.headers['authorization']) {
                try {
                    let authToken = req.headers['authorization'];
                    if (Utils.isUndefinedOrEmptyOrSpace((authToken))) {
                        return res.status(403).send();
                    } else {
                        if (this.validateAuthToken(authToken)) {
                            res.setHeader('Authorization', 
                                this.slideAuthTokenExpiration(authToken, Utils.getUTCDateTimestamp(0, 0, 0, 0), Utils.getUTCDateTimestamp(0, 0, 20, 0))); // Slide 20 mins
                            return next();
                        } else {
                            return res.status(403).send();
                        }
                    }
    
                } catch (ex) {
                    return res.status(403).send();
                }
            } else {
                return res.status(403).send();
            }
        } catch (ex) {
            return res.status(403).send();
        }
    }
};
