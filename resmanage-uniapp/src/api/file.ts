import {request} from "@/utils/request";

let file = {
    // 根据文件名和所属文件夹查询
    queryFile: (data: {page:Number,limit:Number,folderId?:Number,fileName?:String}) => request('api/file/query', 'GET', data),
    // 新增文件夹
    addFolder: (data: {folderName:String}) => request('api/file/addFolder', 'POST', data),
}
export default file
