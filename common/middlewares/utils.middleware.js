"use strict";

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

Date.prototype.addHours = function (h) {
    var date = new Date(this.valueOf());
    date.setTime(date.getTime() + h * 60 * 60 * 1000);
    return date;
};

Date.prototype.addMins = function (m) {
    var date = new Date(this.valueOf());
    date.setTime(date.getTime() + m * 60 * 1000);
    return date;
};

Date.prototype.addSecs = function (s) {
    var date = new Date(this.valueOf());
    date.setTime(date.getTime() + s * 1000);
    return date;
};

module.exports = class Utils {
    constructor() {}

    static isUndefinedOrEmptyOrSpace(str) {
        return (
            str === undefined ||
            str === null ||
            String(str).match(/^ *$/) !== null
        );
    }

    static getUTCDateTimestamp(addedDays, addedHours, addedMins, addedSecs) {
        let date = new Date();

        if (addedDays > 0) {
            date = date.addDays(addedDays);
        }

        if (addedHours > 0) {
            date = date.addHours(addedHours);
        }

        if (addedMins > 0) {
            date = date.addMins(addedMins);
        }

        if (addedSecs > 0) {
            date = date.addSecs(addedSecs);
        }

        let ticks = ((date.getTime() * 10000) + 621355968000000000);

        return ticks;

        //return date.getTime();
    }

    static parseUTCDateTimestamp(timestamp) {
        return new Date((parseInt(timestamp) - 621355968000000000) / 10000);
        //return new Date(parseInt(timestamp));
    }

};
