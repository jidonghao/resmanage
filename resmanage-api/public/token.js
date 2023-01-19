//用于生成和解析token
import jwt from 'jsonwebtoken'

export let signKey = 'mes_qdhd_mobile_xhykjyxgs'


export let setToken = (phoneNumber, id) => {
    return new Promise((resolve, reject) => {
        const token = 'Bearer ' + jwt.sign({
            phoneNumber, id
        }, signKey, {expiresIn: '1h'});
        resolve(token);
    })
}

export let verToken = (token) => {
    return new Promise((resolve, reject) => {
        //
        let info = jwt.verify(token.split(' ')[1], signKey);
        resolve(info);
    })
}
