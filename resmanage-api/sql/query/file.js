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
            return sql(`select id,type,type_detail as typeDetail, file_name as fileName,add_time as addTime,update_time as updateTime from res_file where deleted = 0 and user_id = ${userId} and folder_id = ${folderId} ${fileName?"and file_name like '%"+fileName+"%'":''} LIMIT ${(page - 1) * limit},${limit}`)
        }).then(data => {
            return Promise.resolve({list: data, total: count, page, limit, pages: Math.ceil(count / limit)})
        })
    },
    /**
     * 新增
     * @param userId 用户id
     * @param folderName 文件夹名称
     * @returns {Promise<*>}
     */
    addFolder: (userId, folderName) => {
        let addTime = tools.formatDate(new Date().getTime())
        return sql(`INSERT INTO res_file (user_id,file_name,type,update_time,add_time)  VALUES(${userId},'${folderName}',1,'${addTime}','${addTime}')`)
    }
}

export default file