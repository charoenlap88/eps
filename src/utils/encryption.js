const CryptoJS = require("crypto-js");
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();
// console.log('SECRET', process.env.SECRET)
const ENCRYPTION_KEY = 'f959f579b0c93a1c16010d06cc11baef';
const encode = (data) => CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
const decode = (ciphertext) => {
    var bytes  = CryptoJS.AES.decrypt(ciphertext,ENCRYPTION_KEY);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
};

const base64Encode = (text) => CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
const base64Decode = (base64Encoded) => CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(base64Encoded));
const fromHexString = (hexString) => Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const generateSalt = () => CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);; // use only register save in column salt

const hashPassword = (password,salt) => {
    const passwordWordArray = CryptoJS.enc.Utf8.parse(password);
    const saltWordArray = CryptoJS.enc.Hex.parse(salt);
  
    const hash = CryptoJS.HmacSHA256(passwordWordArray, saltWordArray);
    return hash.toString(CryptoJS.enc.Hex);
}


module.exports = {
    encode, decode, hashPassword, fromHexString, generateSalt
}