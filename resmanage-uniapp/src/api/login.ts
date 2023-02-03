import {request} from "@/utils/request";

let login = {
    login: (data: Object):any => request('api/user/login', 'POST', data),
    getCode: (data: Object):any => request('api/user/getCode', 'POST', data),
}
export default login

