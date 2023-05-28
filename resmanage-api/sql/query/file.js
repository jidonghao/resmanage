import sql from '../sql.js'
import tools from "../../tools/tools.js";

let file = {
    /**
     * 查询
     * @param userId 用户id
     * @param page 页码
     * @param limit 一页几条
     * @param folderId 文件夹id
     * @param fileName 文件名
     * @returns {Promise<*>}
     */
    getFileList: (userId, page, limit, folderId, fileName) => {
        let count = 0
        return sql(`select COUNT(*) from res_file where deleted = 0 and user_id = ${userId} and folder_id = ${folderId} ${fileName?"and file_name like '%"+fileName+"%'":''}`).then(data => {
            count = data[0]['COUNT(*)']
            return sql(`
select id,type,type_detail as typeDetail, file_name as fileName,file_path as filePath,full_type as fullType,add_time as addTime,update_time as updateTime 
from res_file where deleted = 0 and user_id = ${userId} 
and folder_id = ${folderId} ${fileName?"and file_name like '%"+fileName+"%'":''} 
ORDER BY 
CASE WHEN full_type = 'folder' THEN 1 ELSE 2 END, 
update_time DESC 
LIMIT ${(page - 1) * limit},${limit}`)
        }).then(data => {
            return Promise.resolve({list: data, total: count, page, limit, pages: Math.ceil(count / limit)})
        })
    },

    /**
     * 新增
     * @param userId 用户id
     * @param folderName 文件夹名称
     * @param folderId 父文件夹的id
     * @returns {Promise<*>}
     */
    addFolder: ({userId, folderName, folderId=-1}) => {
        let addTime = tools.formatDate(new Date().getTime())
        return sql(`INSERT INTO res_file (user_id,file_name,folder_id,type,full_type,update_time,add_time)
 VALUES(${userId},'${folderName}',${folderId},1,'folder','${addTime}','${addTime}')`)
    },
    addFile: ({userId, fileName, folderId=-1,typeDetail,filePath,type}) => {
        let addTime = tools.formatDate(new Date().getTime())
        return sql(`INSERT INTO res_file (user_id,type_detail,file_path,file_name,full_type,folder_id,type,update_time,add_time)
 VALUES(${userId},'${typeDetail}','${filePath}','${fileName}','${type}',${folderId},1,'${addTime}','${addTime}')`)
    },
}

export default file