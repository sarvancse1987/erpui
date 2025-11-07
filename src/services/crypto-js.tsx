import CryptoJS from "crypto-js";

const SECRET_KEY = "my-user-authorized-key-data";

export const encryptData = (data: any): string => {
  const json = JSON.stringify(data);
  return CryptoJS.AES.encrypt(json, SECRET_KEY).toString();
};

export const decryptData = (cipherText: string): any => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
};
