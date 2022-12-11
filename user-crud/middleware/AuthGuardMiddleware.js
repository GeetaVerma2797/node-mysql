const lodash = require('lodash');
const jwtUtils = require('./../common/jwtUtils');


//// AuthGuard Middleware for protected routes using JWT///
const authGuardJWT = async (req, res, next) => {
    try {
        if (!req.headers.token) {
            return res.status(401).json({status: 401, message: 'Please login to get access.', error: 'BAD_REQUEST'});
        }        
        const token = req.headers.token;  
        let userAuth = jwtUtils.jwtVerify(token); 
        if(lodash.isEmpty(userAuth) || !userAuth.user_id){
            return res.status(401).json({status: 401, message: 'Please login to proceed!', error: 'User Not Authorized'});
        }
        req.AuthUser = userAuth;
        return next();
    } catch (err) {
        return res.status(401).json({status: 401, message: 'Your session has expired!', error: err});
    }
};

module.exports = authGuardJWT;