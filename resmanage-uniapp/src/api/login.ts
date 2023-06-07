import {request} from "@/utils/request";

let login = {
    login: (data: Object):any => request('api/user/login', 'POST', data),
    getCode: (data: Object):any => request('api/user/getCode', 'POST', data),
    loginByCode: (data: Object):any => request('api/user/loginByCode', 'POST', data),
    register: (data: Object):any => request('api/user/register', 'POST', data),
    changePasswd:(data: Object):any => request('api/user/changePasswd', 'POST', data),
    changeNumber:(data: Object):any => request('api/user/changeNumber', 'POST', data),
    changeAvatar:(data: Object):any => request('api/user/changeAvatar', 'POST', data),
    changeNickname:(data: Object):any => request('api/user/changeNickname', 'POST', data),
}
export default login

