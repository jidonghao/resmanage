import sql from '../sql.js'
import tools from "../../tools/tools.js";

let login = {
    queryByPhoneNumber: (phoneNumber, passwd) => sql(`select phone_number,passwd,identity,id,nick_name,avatar from user where phone_number = ${phoneNumber} and deleted = 0`),
    createUser: (phoneNumber, userName) => {
        let addTime = tools.formatDate(new Date().getTime())
        return sql(`INSERT INTO user (nick_name,phone_number,create_time,update_time)  VALUES('${userName}',${phoneNumber},'${addTime}','${addTime}')`)
    },
    changePasswd: (id, passwdOld, passwd) => {
        return sql(`select passwd from user where id = ${id}`).then(data => {
            let sqlBack = data[0]
            if (!sqlBack?.passwd || (sqlBack?.passwd === passwdOld)) {
                return sql(`UPDATE user set passwd = "${passwd}" where id = ${id}`)
            } else {
                return Promise.reject("密码错误")
            }
        })
    },
}

export default login