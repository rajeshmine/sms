import  {config} from '../config/config';
import JSAlert from 'js-alert';
import Cryptr from 'cryptr';

const key = config.encryptKey;
const cryptr = new Cryptr(key);

export default class Service {

  static showAlert(Message, Title, Type) {
    JSAlert.alert(Message, Title, JSAlert.Icons[Type]);
  }

  static showConfirm(Message, Title, Type, callback) {
    JSAlert.confirm(Message, Title, JSAlert.Icons[Type]).then((result) => {
      callback(result);
    });
  }

  static alertDisplay(Message, Title, Type) {
    this.showAlert(Message, Title, Type);
  }
 
  static confirmDisplay(Message, Title, Type, callback) {
    this.showConfirm(Message, Title, Type, (result) => {
      callback(result);
    });
  }

  static encryptObj(obj, callback) {
    let temp = JSON.stringify(obj);
    const encryptStr = cryptr.encrypt(temp);
    callback(encryptStr);
  }

  static decryptObj(obj, callback) {
    try {
      const decryptStr = cryptr.decrypt(obj);
      let temp = JSON.parse(decryptStr);
      callback(temp);
    } catch (err) {
      let obj = {
        isLoggedIn: false
      }
      callback(obj);
    }
  }

  static getStoredValue(callback) {
    let encryptedVal = sessionStorage.__info;
    this.decryptObj(encryptedVal, (res) => {
      callback(res)
    });
  }
}