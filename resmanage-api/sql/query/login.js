import sql from '../sql.js'
import tools from "../../tools/tools.js";
import CryptoJS from "crypto-js";
import ENV from "../../config/index.js";

let login = {
    // queryByPhoneNumber: (phoneNumber, passwd) => sql(`select phone_number,passwd,identity,id,nick_name,avatar from user where phone_number = ${phoneNumber} and deleted = 0`),
    checkUserExists: (username) => {
        return sql(`
        SELECT COUNT(*) as count FROM user WHERE username = ?
    `, [username]).then(data => {
            return data[0].count > 0;
        });
    },
    queryByUsername: (user, passwd) => sql(`select * from user where username = ? and deleted = 0`, [user]),
    createUser: (userName, nickName, passwd='') => {
        let addTime = tools.formatDate(new Date().getTime())
        return sql(`
        INSERT INTO user (username, nick_name, passwd, create_time, update_time) 
        VALUES(?, ?, ?, ?, ?)
    `, [userName, nickName, passwd, addTime, addTime]);
    },
    changePasswd: (id, passwdOld, passwd) => {
        return sql(`SELECT passwd FROM user WHERE id = ?`, [id]).then(data => {
            let sqlBack = data[0];
            if (!sqlBack?.passwd) {
                return Promise.reject("用户不存在");
            }
            let passwdSqlBack = CryptoJS.AES.decrypt(sqlBack.passwd, ENV.PASSWORD_KEY).toString(CryptoJS.enc.Utf8);

            if (passwdSqlBack !== passwdOld) {
                return Promise.reject("密码错误");
            }
            return sql(`UPDATE user SET passwd = ? WHERE id = ?`, [passwd, id]);
        });
    },

    changeNumber: (phoneNumber, id) => sql(`UPDATE user set phone_number = "${phoneNumber}", update_time = "${tools.formatDate(new Date().getTime())}" where id = ${id}`),
    changeNickname: (nickname, id) => sql(`UPDATE user set nick_name = "${nickname}", update_time = "${tools.formatDate(new Date().getTime())}" where id = ${id}`),
    changeAvatar: (avatar, id) => sql(`UPDATE user set avatar = "${avatar}", update_time = "${tools.formatDate(new Date().getTime())}" where id = ${id}`),
}

export default login
