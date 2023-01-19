import {request} from "@/utils/request";

let manage = {
    getInfo: (data: Object):any => request('getTime', 'GET', data),
}
export default manage
