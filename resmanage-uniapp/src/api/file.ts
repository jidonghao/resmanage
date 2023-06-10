import {request} from "@/utils/request";

let file = {
    // 根据文件名和所属文件夹查询
    queryFile: (data: {page:Number,limit:Number,folderId?:Number,fileName?:String,labelIds?:string}) => request('api/file/query', 'GET', data),
    // 新增文件夹
    addFolder: (data: {folderName:String,folderId:number}) => request('api/file/addFolder', 'POST', data),
    // 新增标签
    addLabel: (data: {labelName: String}) => request('api/file/addLabel', 'POST', data),
    // 删除标签
    deleteLabel: (data: {labelId: Number}) => request('api/file/deleteLabel', 'POST', data),
    // 更新标签
    updateLabel: (data: {labelId: Number, labelName: String}) => request('api/file/updateLabel', 'POST', data),
    // 查询标签列表
    getLabels: () => request('api/file/getLabels', 'GET'),

    // 添加标签到文件
    addLabelToItem: (data: {fileId: Number, labelId: Number}) => request('api/file/addLabelToItem', 'POST', data),
    // 从文件中移除标签
    removeLabelFromItem: (data: {fileId: Number, labelId: Number}) => request('api/file/removeLabelFromItem', 'POST', data),
    // 根据标签ID查询文件
    getFilesByLabel: (data: {labelId: Number}) => request('api/file/getFilesByLabel', 'GET', data),
    // 更新文件查看时间
    updateQueryTime: (data: {fileId:Number}) => request('api/file/updateQueryTime', 'POST', data),
    // 获取最近七天查看过的文件列表
    getRecentlyViewedFiles: (data: {page:Number,limit:Number}) => request('api/file/getRecentlyViewedFiles', 'GET', data),
    // 清除所有文件的查看时间
    removeAllQueryTimes: () => request('api/file/removeAllQueryTimes', 'POST'),
    // 修改文件名
    updateFileName: (data: {fileId:Number, fileName:String}) => request('api/file/updateFileName', 'POST', data),
    // 删除文件
    deleteFile: (data: {fileId:Number}) => request('api/file/deleteFile', 'POST', data),

}
export default file
