import {request} from "@/utils/request";

let login = {
    login: (data: Object):any => request('api/user/login', 'POST', data),
    getCode: (data: Object):any => request('api/user/getCode', 'POST', data),
    loginByCode: (data: Object):any => request('api/user/loginByCode', 'POST', data),
}
export default login

