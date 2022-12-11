const config = require('config');
const Encryption = require('./../common/encryptionUtility');
const { ENC_KEY, ENC_IV } = config.ENCRYPTION;

const newEncryption = new Encryption(ENC_KEY, ENC_IV);

exports.decryptBody = async (req, res, next) => {
  try { 
    // return next();
    const { encryptedBody } = req.body;
    if (!encryptedBody)
      return res.json({
        code: 400,
        status: 'Error',
        message: '`encryptedBody` key is required'
      })
    const clientDecrypted = newEncryption.clientDecrypt(encryptedBody); // encrypted from client side
    const decryptedBody = JSON.parse(clientDecrypted);
  
    req.body = decryptedBody;
    next();
  } catch (error) {
      res.status(500).json({message: "Error Occurred: "+error, code: 500});
  }
};

exports.encryptBody = dataToEncrypt => {
  try {  
    // return dataToEncrypt;
    if (!dataToEncrypt) throw new Error('dataToEncrypt is required');
    dataToEncrypt = typeof dataToEncrypt === 'object' ? JSON.stringify(dataToEncrypt) : `${dataToEncrypt}`;
    const clientEncrypted = newEncryption.clientEncrypt(dataToEncrypt);
    return clientEncrypted;
  } catch (error) {
    res.status(404).json({message: "Error Occurred: "+error, code: 404});
  }
};

exports.encryptHandler = async (req, res, next) => {
  try {
    const clientEncrypted = newEncryption.clientEncrypt(JSON.stringify(req.body));
    res.json({ encryptedBody: clientEncrypted });
  } catch (err) {
    throw err;
  }
};

exports.decryptHandler = async (req, res, next) => {
  try {
    const { encryptedBody } = req.body;
    if (!encryptedBody)
      return res.json({
        code: 400,
        status: 'Error',
        message: '`encryptedBody` key is required'
      });
    const clientDecrypted = newEncryption.clientDecrypt(encryptedBody);
    const decryptedBody = JSON.parse(clientDecrypted);
    res.status(200).json({ decryptedBody });
  } catch (err) {
    throw err;
  }
};

