module.exports = function (req, resp, next) {
    let next_url = req.query['next'];
    if (next_url === undefined) {
        next_url = '/'
    }

    req.next_url = next_url;
    return next();
};