import {request} from "@/utils/request";

let login = {
    login: (data: Object):any => request('login', 'POST', data),
}
export default login

