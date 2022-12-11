const { createCipheriv, createDecipheriv } = require('crypto');
const CryptoJS = require('crypto-js');

/**
 * @class Encryption : A common module for ENCRYPTION of PI data across DB & Client-End side
 * @param : ENC_KEY | string
 * pass this ENC_KEY at both client and DB end for encryption
 * initialize the class with same ENC_KEY to use its encryption methods.
 *
 * NOTE: SERVER CAN DECRYPT ANY ENCRYPTED MSG from DB OR CLIENT SIDE
 * @author: Geeta Verma
 */


class Encryption {
  constructor(ENC_KEY, ENC_IV) {
    this.ENC_KEY = ENC_KEY;
    this.ENC_ALGO = 'aes-256-cbc';
    this.ENC_IV = ENC_IV;
    // this.ENC_ALGO = 'aes-128-ecb'; // MySQL AES_ENCRYPT() function uses it by Default
    // this.ENC_IV = ''; // empty string for AES ECB block mode
  }

  /**
   * @function convertCryptKey(@param):
   * It is a key derivation function (KDF), used to
   * derive a key from the encryption password
   * @param {1} strKey | string
   * NOTE: In Cryptography encryption_key and encryption_password are not same thing.
   */

  convertCryptKey(strKey) {
    const newKey = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const bufStrKey = Buffer.from(strKey);
    for (let i = 0; i < bufStrKey.length; i++) {
      newKey[i % 16] ^= bufStrKey[i];
    }
    return newKey;
  }

  clientDecrypt(encryptedStr) {
    try {
      if (!encryptedStr) return null;
      var bytes = CryptoJS.AES.decrypt(encryptedStr, this.ENC_KEY);
      var decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (err) {
      throw err;
    }
  }

  clientEncrypt(plainText) {
    try {
      if (!plainText) return null;
      var encrypted = CryptoJS.AES.encrypt(plainText, this.ENC_KEY).toString();
      return encrypted;
    } catch (err) {
      throw err;
    }
  }
  
  dbEncrypt(data) {
    if (!data) return null;
    const cipher = createCipheriv(this.ENC_ALGO, this.ENC_KEY, this.ENC_IV);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const encryptedStr = encrypted.toString('base64');
    // console.log('encryptedStr: ' + encryptedStr);
    return encryptedStr;
  }

  dbDecrypt(data) {
    if (!data) return null;
    const decipher = createDecipheriv(this.ENC_ALGO, this.ENC_KEY, this.ENC_IV);
    const decrypted = decipher.update(data, 'base64');
    const decryptedData = Buffer.concat([decrypted, decipher.final()]).toString();
    // console.log('decryptedData: ' + decryptedData);
    return decryptedData;
  }
}

module.exports = Encryption;
