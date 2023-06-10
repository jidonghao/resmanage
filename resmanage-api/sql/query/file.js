import sql from '../sql.js'
import tools from "../../tools/tools.js";

let file = {
    /**
     * 查询
     * @version 2.0 防止sql注入
     * @param userId 用户id
     * @param page 页码
     * @param limit 一页几条
     * @param folderId 文件夹id
     * @param fileName 文件名
     * @param labelIds 标签id数组
     * @returns {Promise<*>}
     */
    getFileList: (userId, page, limit, folderId, fileName, labelIds) => {
        let count = 0;
        let fileNameQuery = fileName ? ["AND file_name LIKE ?", [`%${fileName}%`]] : ['', []];
        let labelQuery = (Array.isArray(labelIds) && labelIds.length > 0) ? ["AND id IN (SELECT file_id FROM res_file_label WHERE label_id IN (?) AND user_id = ? GROUP BY file_id HAVING COUNT(file_id) = ?)", [labelIds, userId, labelIds.length]] : ['', []];
        return sql(`SELECT COUNT(*) FROM res_file WHERE deleted = 0 AND user_id = ? AND folder_id = ? ${fileNameQuery[0]} ${labelQuery[0]}`, [userId, folderId, ...fileNameQuery[1], ...labelQuery[1]])
            .then(data => {
                count = data[0]['COUNT(*)'];
                let params = [userId, folderId, ...fileNameQuery[1], ...labelQuery[1], (page - 1) * limit, limit];
                // When fileName is null or '', fileNameQuery[1] is empty, so we need to remove it from params
                params = params.filter((item, index) => {
                    return !(index === 2 && item.length === 0);
                });
                return sql(`
SELECT id,type,type_detail as typeDetail, file_name as fileName,file_path as filePath,full_type as fullType,add_time as addTime,update_time as updateTime 
FROM res_file WHERE deleted = 0 AND user_id = ? AND folder_id = ? ${fileNameQuery[0]} ${labelQuery[0]} 
ORDER BY 
CASE WHEN full_type = 'folder' THEN 1 ELSE 2 END, 
update_time DESC 
LIMIT ?,?`, params);
            })
            .then(data => {
                const fileIds = data.map(file => file.id);
                if(fileIds.length === 0) {
                    return [];
                }
                return sql(`SELECT * FROM res_file_label WHERE file_id IN (?) AND user_id = ?`, [fileIds, userId])
                    .then(labelData => {
                        const labelMap = {};
                        labelData.forEach(label => {
                            if (!labelMap[label.file_id]) {
                                labelMap[label.file_id] = [];
                            }
                            labelMap[label.file_id].push(label.label_id);
                        });
                        data.forEach(file => {
                            file.labelIds = labelMap[file.id] || [];
                        });
                        return data;
                    });
            })
            .then(fileList => {
                return Promise.resolve({list: fileList, total: count, page, limit, pages: Math.ceil(count / limit)})
            });
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
    addLabelToItem: (userId, fileId, labelId) => {
        // First, verify the user is the owner of the file
        return sql(`SELECT user_id FROM res_file WHERE id = ?`, [fileId])
            .then(data => {
                if (data[0] && data[0].user_id === userId) {
                    // If user is owner, then add the label
                    return sql(`INSERT INTO res_file_label (file_id, label_id, user_id) VALUES (?, ?, ?)`, [fileId, labelId, userId]);
                } else {
                    throw new Error("User does not own the file.");
                }
            });
    },
    // In the file object
    addLabel: (userId, labelName) => {
        return new Promise((resolve, reject) => {
            sql(`SELECT COUNT(*) AS count FROM res_label WHERE user_id = ? AND label_name = ?`, [userId, labelName])
                .then(result => {
                    if (result[0].count > 0) {
                        reject('Label already exists');
                    } else {
                        return sql(`INSERT INTO res_label (user_id, label_name, add_time, update_time) VALUES (?, ?, NOW(), NOW())`, [userId, labelName]);
                    }
                })
                .then(data => {
                    if (data) {
                        resolve(data);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    },
    removeLabelFromItem: (userId, fileId, labelId) => {
        // First, verify the user is the owner of the file
        return sql(`SELECT user_id FROM res_file WHERE id = ?`, [fileId])
            .then(data => {
                if (data[0] && data[0].user_id === userId) {
                    // If user is owner, then remove the label
                    return sql(`DELETE FROM res_file_label WHERE file_id = ? AND label_id = ? AND user_id = ?`, [fileId, labelId, userId]);
                } else {
                    throw new Error("User does not own the file.");
                }
            });
    },
    addNewLabel: (userId, labelName) => {
        // Add the label for the user
        return sql(`INSERT INTO res_label (user_id, label_name, add_time) VALUES (?, ?, NOW())`, [userId, labelName]);
    },
    deleteLabel: (userId, labelId) => {
        // Verify if the user is the owner of the label and then delete the label
        return sql(`UPDATE res_label SET deleted = 1 WHERE id = ? AND user_id = ?`, [labelId, userId])
            .then(() => {
                return sql(`UPDATE res_file_label SET deleted = 1 WHERE label_id = ?`, [labelId]);
            });
    },

    getLabels: (userId) => {
        // Fetch labels for the user
        return sql(`SELECT id, label_name as labelName FROM res_label WHERE user_id = ? AND deleted = 0`, [userId]);
    },
    getFilesByLabel: (userId, labelId) => {
        // Fetch files based on label for the user
        return sql(`
        SELECT res_file.* 
        FROM res_file
        INNER JOIN res_file_label ON res_file.id = res_file_label.file_id
        WHERE res_file_label.label_id = ? AND res_file.user_id = ?
    `, [labelId, userId]);
    },
    updateQueryTime: (userId, fileId) => {
        let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        return sql(`UPDATE res_file SET query_time = ? WHERE id = ? AND user_id = ?`, [currentTime, fileId, userId]);
    },
    getRecentlyViewedFiles: (userId, page, limit) => {
        // calculate date of 7 days ago
        let sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        let dateString = sevenDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

        let count = 0;
        return sql(`SELECT COUNT(*) FROM res_file WHERE deleted = 0 AND user_id = ? AND query_time > ?`, [userId, dateString])
            .then(data => {
                count = data[0]['COUNT(*)'];
                return sql(`
        SELECT id, type, type_detail AS typeDetail, file_name AS fileName, file_path AS filePath, 
        full_type AS fullType, add_time AS addTime, update_time AS updateTime, query_time AS queryTime
        FROM res_file 
        WHERE deleted = 0 AND user_id = ? AND query_time > ?
        ORDER BY query_time DESC 
        LIMIT ?, ?`, [userId, dateString, (page - 1) * limit, limit]);
            })
            .then(data => {
                return Promise.resolve({list: data, total: count, page, limit, pages: Math.ceil(count / limit)});
            });
    },
    removeAllQueryTimes: (userId) => {
        return sql(`UPDATE res_file SET query_time = NULL WHERE user_id = ?`, [userId]);
    },
    updateFileName: (userId, fileId, fileName) => {
        return sql(`
    UPDATE res_file 
    SET file_name = ?
    WHERE id = ? AND user_id = ? AND deleted = 0`, [fileName, fileId, userId]);
    },
    deleteFile: (userId, fileId) => {
        return sql(`UPDATE res_file SET deleted = 1 WHERE user_id = ? AND id = ?`, [userId, fileId]);
    },
    updateLabel: (userId, labelId, labelName) => {
        // Update label name
        return sql(`
        UPDATE res_label 
        SET label_name = ? 
        WHERE id = ? AND user_id = ?
    `, [labelName, labelId, userId]);
    },
}

export default file