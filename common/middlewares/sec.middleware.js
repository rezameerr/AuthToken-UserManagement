"use strict";

const authTokenHMACKey = require("../config/env.config.js").authTokenHMACKey;
const authTokenSymKey256 = require("../config/env.config.js").authTokenSymKey256;
const authTokenIV16 = require("../config/env.config.js").authTokenIV16;
const authTokenSymAlg = require("../config/env.config.js").authTokenSymAlg;

const Crypto = require("crypto");
const CryptoJS = require("crypto-js");

module.exports = class SecurityUtils {
    constructor() {}

    static secureRandom(lengthInBytes) {
        try {
            return Crypto.randomBytes(lengthInBytes).toString("base64");
        } catch (ex) {
            return null;
        }
    }

    static secureRandomNumeric(length) {
        try {
            const table = "0123456789".split('');
            let res = "";

            for (let i = 0; i < length; i++) {
                res += table[Crypto.randomInt(0, table.length)];
            }
            return res;
        } catch (ex) {
            return null;
        }
    }

    static secureRandomNumericStartNonZero(length) {
        try {
            let res = "";

            let table = "123456789".split('');
            res += table[Crypto.randomInt(0, table.length)];

            table = "0123456789".split('');

            for (let i = 1; i < length; i++) {
                res += table[Crypto.randomInt(0, table.length)];
            }
            return res;
        } catch (ex) {
            return null;
        }
    }

    static getSHA512(msg) {
        try {
            return Crypto.createHash("sha512").update(msg).digest("base64");
        } catch (ex) {
            return null;
        }
    }

    static getHMAC(msg, secretKey) {
        try {
            return Crypto.createHmac("sha512", secretKey).update(msg).digest("base64");
        } catch (ex) {
            return null;
        }
    }

    static encrypt(data, key, iv) {
        try {
            const parsedData = CryptoJS.enc.Utf8.parse(data);
            const parsedKey = CryptoJS.enc.Base64.parse(key);
            const parsedIV = CryptoJS.enc.Base64.parse(iv);

            const aesCipher = CryptoJS.AES.encrypt(parsedData, parsedKey, {
                iv: parsedIV,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });

            const result = CryptoJS.enc.Base64.stringify(aesCipher.ciphertext);
            //const result = aesCipher.toString(CryptoJS.format.Base64);

            return result;
        } catch (ex) {
            return null;
        }
    }

    static decrypt(data, key, iv) {
        try {
            const parsedData = CryptoJS.enc.Base64.parse(data);
            const parsedKey = CryptoJS.enc.Base64.parse(key);
            const parsedIV = CryptoJS.enc.Base64.parse(iv);

            const aesCipher = CryptoJS.AES.decrypt(data, parsedKey, {
                iv: parsedIV,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });

            const result = CryptoJS.enc.Utf8.stringify(aesCipher);
            //const result = aesCipher.toString(CryptoJS.enc.Utf8);

            return result;
        } catch (ex) {
            return null;
        }
    }
};
