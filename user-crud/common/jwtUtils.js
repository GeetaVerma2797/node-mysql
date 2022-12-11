const config = require('config');
const Encryption = require('./encryptionUtility');
const { JWT_ENC_KEY, JWT_ENC_IV } = config.JWT_ENCRYPTION;
const jwtEncryption = new Encryption(JWT_ENC_KEY, JWT_ENC_IV);
const jwt = require('jsonwebtoken');

const jwtSign = (jwtData) => {
    jwtData = {
        detail: jwtEncryption.clientEncrypt(JSON.stringify(jwtData))
    }
    return jwt.sign(jwtData, config.jwt.SECRET, { expiresIn: config.jwt.EXPIRES_IN });
}

const jwtVerify = (jwtToekn) => {
    const jwtData = jwt.verify(jwtToekn, config.jwt.SECRET);
    return JSON.parse(jwtEncryption.clientDecrypt(jwtData.detail));    
}

module.exports = {jwtSign, jwtVerify}