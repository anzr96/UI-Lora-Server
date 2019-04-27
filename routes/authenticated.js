// Authentication middleware for passport
module.exports = function ( request, response, next ) {
    if ( request.isAuthenticated() ) {
        return next();
    }

    response.redirect('/auth/login/?next=' + request.url);
};