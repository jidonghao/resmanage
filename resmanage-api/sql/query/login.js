import sql from '../sql.js'
import tools from "../../tools/tools.js";

let login = {
    queryByPhoneNumber: (phoneNumber, passwd) => sql(`select phone_number,passwd,identity,id,nick_name,avatar from user where phone_number = ${phoneNumber} and deleted = 0`),
    createUser:(phoneNumber,userName)=>{
        let addTime = tools.formatDate(new Date().getTime())
        return sql(`INSERT INTO user (nick_name,phone_number,create_time,update_time)  VALUES('${userName}',${phoneNumber},'${addTime}','${addTime}')`)
    }
}

export default login