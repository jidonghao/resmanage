import sql from '../sql.js'

let login = {
    loginByPasswd: (phoneNumber, passwd) => sql(`select phone_number,passwd,identity,id,nick_name,avatar from user where phone_number = ${phoneNumber} and deleted = 0`)
}

export default login