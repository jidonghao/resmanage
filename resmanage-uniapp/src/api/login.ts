import {request} from "@/utils/request";

let login = {
    login: (data: Object):any => request('api/user/login', 'POST', data),
    getCode: (data: Object):any => request('api/user/getCode', 'POST', data),
    loginByCode: (data: Object):any => request('api/user/loginByCode', 'POST', data),
    changePasswd:(data: Object):any => request('api/user/changePasswd', 'POST', data),
}
export default login

