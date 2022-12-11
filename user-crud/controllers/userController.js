const { emailValidate, passValidate } = require('../common/common-util');
const moment = require('moment');
const jwtUtils = require('../common/jwtUtils');
const { encryptBody } = require('../middleware/encryptionMiddleware');

module.exports = {
    registerUser: async function (req, res, next) {
        try {
            if ((!req.body.name || !req.body.phone || isNaN(req.body.phone) || (req.body.phone).length != 10) || (!req.body.email || !emailValidate(req.body.email) || (!req.body.password || !passValidate(req.body.password)))) {
                let msg = !req.body.name ? "Name is required" :
                    ((!req.body.phone || isNaN(req.body.phone) || (req.body.phone).length != 10) ? "10 digits mobile number is required" :
                        ((!req.body.email || !emailValidate(req.body.email)) ? "Email is required" : ((!req.body.password || !passValidate(req.body.password)) ? "Password must have minimum 8 and maximum 10 character with at least one lowercase, one uppercase, 1 special character" : "Client side error")))
                return res.status(401).json({
                    status: {
                        message: msg,
                        code: 401
                    }
                })
            }
            let name = req.body.name ? req.body.name : '';
            let phone = req.body.phone ? req.body.phone : '';
            let email = req.body.email ? req.body.email : '';
            let password = req.body.password ? req.body.password : '';
            let role = req.body.role ? req.body.role : 0;
            let status = 1;

            let c_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            let insertQuery = `CALL USER_REGISTER('${phone}','${email}','${name}','${password}','${c_date}','${c_date}','${role}','${status}')`;
            sql.query(insertQuery, async function (err, result) {
                if (err) return res.status(404).json({ status: { message: "Error: " + err, code: 404 } });
                let statusCode = result[0][0].register_status == 1 ? 200 : 401;
                return res.status(statusCode).json({
                    status: {
                        message: result[0][0].message,
                        code: statusCode,
                    }
                });
            });
        } catch (error) {
            console.log("error", error.message, error.stack);
            return res.status(404).json({
                status: {
                    message: "Error occured: " + error.message,
                    code: 404
                }
            })
        }
    },
    loginUser: async function (req, res, next) {
        try {
            if ((!req.body.email || !emailValidate(req.body.email) || (!req.body.password || !passValidate(req.body.password)))) {
                let msg = (!req.body.email || !emailValidate(req.body.email)) ? "Email is required" : ((!req.body.password || !passValidate(req.body.password)) ? "Password must have minimum 8 and maximum 10 character with at least one lowercase, one uppercase, 1 special character" : "Client side error");
                return res.status(401).json({
                    status: {
                        message: msg,
                        code: 401
                    }
                })
            }
            let email = req.body.email;
            let password = req.body.password;
            let user = `CALL USER_lOGIN('${email}','${password}')`;
            sql.query(user, function (err, result) {
                if (err) return res.status(404).json({ status: { message: "Error: " + err, code: 404 } });
                if (result[0][0].login_status == 1) {
                    let userDetails = result[0][0];
                    let respData = {
                        user_id: userDetails.user_id,
                        id: userDetails.name,
                        email: userDetails.email,
                        phone: userDetails.phone,
                        role: userDetails.role,
                        status: userDetails.status
                    };
                    const jwtDataToken = jwtUtils.jwtSign(respData);
                    // const token = jwt.sign(
                    //     { user_d: userDetails.user_id, id: userDetails.name, email: userDetails.email, phone: userDetails.phone, role: userDetails.role, status: userDetails.status },
                    //     process.env.JWT_KEY,
                    //     { expiresIn: "2h" }
                    // );
                    return res.status(200).json({
                        status: {
                            message: "LoggedIn Successfully",
                            code: 200
                        },
                        data: {
                            phone: req.body.phone,
                            token: jwtDataToken
                        }
                    });
                } else if (result[0][0].login_status == 0) {
                    return res.status(404).json({
                        status: {
                            message: "Invalid user",
                            code: 404
                        }
                    });
                }
            });
        } catch (error) {
            console.log("error", error.message, error.stack);
            return res.status(404).json({
                status: {
                    message: "Error occured: " + error.message,
                    code: 404
                }
            })
        }
    },
    getUsers: async function (req, res, next) {
        try {
            if (!req.AuthUser || !req.AuthUser?.user_id) {
                let msg = "User not authorized";
                return res.status(401).json({
                    status: {
                        message: msg,
                        code: 401
                    }
                });
            }
            let userAuth = req.AuthUser;
            if (userAuth.role != 1) {
                return res.status(401).json({
                    status: {
                        message: "You can't access user list",
                        code: 401
                    }
                })
            }
            let user = `CALL GET_USERS()`;
            sql.query(user, function (err, result) {
                if (err) return res.status(404).json({ status: { message: "Error: " + err, code: 404 } });
                if (result[0] && result[0].length) {
                    let userDetails = result[0];
                    return res.status(200).json({
                        status: {
                            message: "User list fetched Successfully",
                            code: 200
                        },
                        data: encryptBody(userDetails)
                    });
                } else {
                    return res.status(404).json({
                        status: {
                            message: "User not found",
                            code: 404
                        }
                    });
                }
            });
        } catch (error) {
            console.log("error", error.message, error.stack);
            return res.status(404).json({
                status: {
                    message: "Error occured: " + error.message,
                    code: 404
                }
            })
        }
    },
    updateUser: async function (req, res, next) {
        try {
            if (!req.AuthUser || !req.AuthUser?.user_id) {
                let msg = "User not authorized";
                return res.status(401).json({
                    status: {
                        message: msg,
                        code: 401
                    }
                });
            }
            if (!req.params.id || isNaN(req.params.id)) {
                let msg = "User id is required";
                return res.status(401).json({
                    status: {
                        message: msg,
                        code: 401
                    }
                })
            }
            let email = req.body.email ? req.body.email : '';
            let name = req.body.name ? req.body.name : '';
            let role = req.body.role ? req.body.role : '';
            let phone = req.body.phone ? req.body.phone : '';
            let u_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

            let user = `CALL UPDATE_USER(${req.params.id},'${phone}','${email}','${name}','${u_date}','${role}')`;
            sql.query(user, function (err, result) {
                if (err) return res.status(404).json({ status: { message: "Error: " + err, code: 404 } });
                if (result.affectedRows > 0) {
                    return res.status(200).json({
                        status: {
                            message: "User updated Successfully",
                            code: 200
                        }
                    });
                } else {
                    return res.status(404).json({
                        status: {
                            message: "Invalid user id",
                            code: 404
                        }
                    });
                }
            });
        } catch (error) {
            console.log("error", error.message, error.stack);
            return res.status(404).json({
                status: {
                    message: "Error occured: " + error.message,
                    code: 404
                }
            })
        }
    },
    deleteUser: async function (req, res, next) {
        try {
            if (req.AuthUser.role != 1) {
                return res.status(401).json({
                    status: {
                        message: "You are not authorized to delete any user",
                        code: 401
                    }
                })
            }
            if (!req.AuthUser || !req.AuthUser?.user_id) {
                let msg = "User not authorized";
                return res.status(401).json({
                    status: {
                        message: msg,
                        code: 401
                    }
                });
            }
            if (!req.params.id || isNaN(req.params.id)) {
                let msg = "User id is required";
                return res.status(401).json({
                    status: {
                        message: msg,
                        code: 401
                    }
                })
            }
            let u_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

            let user = `CALL DELETE_USER(${req.params.id}, '${u_date}')`;
            sql.query(user, function (err, result) {
                if (err) return res.status(404).json({ status: { message: "Error: " + err, code: 404 } });
                if (result.affectedRows > 0) {
                    return res.status(200).json({
                        status: {
                            message: "User deleted Successfully",
                            code: 200
                        }
                    });
                } else {
                    return res.status(404).json({
                        status: {
                            message: "Invalid user id or user already deleted",
                            code: 404
                        }
                    });
                }
            });
        } catch (error) {
            console.log("error", error.message, error.stack);
            return res.status(404).json({
                status: {
                    message: "Error occured: " + error.message,
                    code: 404
                }
            })
        }
    }
}