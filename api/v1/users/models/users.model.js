const mongoose = require("../../../../common/services/mongoose.service").mongoose;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    uuid: String,
    user_type: String,
    username: String,
    mobile_number: String,
    mobile_number_country_calling_code: String,
    local_mobile_number: String,
    country: String,
    country_name: String,
    country_code: String,
    locale: String,
    language: String,
    email: String,
    salt: String,
    password_hash: String,
    name: String,
    firstname: String,
    lastname: String,
    creation_timestamp: String,
    last_update_timestamp: String,
    password_change_required: Number,
    is_active: Number,
    is_deleted: Number,
    doc_ver: String,
});

userSchema.virtual("id").get(function () {
    return this._id.toHexString();
    //return this._id;
});

// Ensure virtual fields are serialised.
userSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

userSchema.findById = function (cb) {
    return this.model("users").find(
        {
            id: this.id,
        },
        cb
    );
};

const User = mongoose.model("users", userSchema);

exports.find = async (q) => {
    let user = null;

    try {
        user = await User.find({
            username: q,
        });

        if (user !== null && user.length > 0) return user;

        user = await User.find({
            mobile_number: q,
        });

        if (user !== null && user.length > 0) return user;

        user = await User.find({
            email: q,
        });

        if (user !== null && user.length > 0) return user;
    } catch (ex) {
        return null;
    }

    return null;
};

exports.findByUsername = async (username) => {
    try {
        return User.find({
            username: username,
        }).then((result) => {
            return result;
        });
    } catch (ex) {}

    return null;
};

exports.findByMobileNumber = async (mobile_number) => {
    try {
        return User.find({
            mobile_number: mobile_number,
        }).then((result) => {
            return result;
        });
    } catch (ex) {}

    return null;
};

exports.findByEmail = async (email) => {
    try {
        return User.find({
            email: email,
        }).then((result) => {
            return result;
        });
    } catch (ex) {}

    return null;
};

exports.findById = async (id) => {
    return User.findById(id).then((result) => {
        result = result.toJSON();
        //delete result._id;
        //delete result.__v;
        return result;
    });
};

exports.create = (userData) => {
    const user = new User(userData);
    return user.save();
};

exports.list = async (perPage, page) => {
    return new Promise((resolve, reject) => {
        User.find()
            .lean()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            });
    });
};

exports.update = async (id, userData) => {
    return User.findOneAndUpdate(
        {
            _id: id,
        },
        {
            $set: userData,
        },
        {
            new: true,
        }
    );
};

exports.removeById = async (user_id) => {
    return new Promise((resolve, reject) => {
        User.deleteMany(
            {
                _id: user_id,
            },
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(err);
                }
            }
        );
    });
};
