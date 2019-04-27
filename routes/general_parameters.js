module.exports = function (req) {
    let obj = {};
    obj.user_fullname = req.user.name;
    obj.user_email = req.user.username;

    return obj;
};
