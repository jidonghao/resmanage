import file from "../sql/query/file.js";
import {resJson} from "../index.js";
import express from "express";
import logger from "../logs/index.js";
const router = express.Router();
/**
 * @api {GET} /api/file/query 获取文件列表
 * @apiGroup file
 * @apiDescription 按用户ID，父文件夹ID? 文件夹名称? 查询
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} page 第几页
 * @apiParam {Number} limit 每页数量
 * @apiParam {Number} folderId 父文件夹ID?
 * @apiParam {String} fileName 父文件夹名称?
 * @apiParamExample {json} request-example
 * {
 *  "page": 1
 *  "limit": 20
 *  "fileName": ""
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，-1:找不到指定用户 0:成功
 * @apiSuccess {Number} total 总数
 * @apiSuccess {Number} page 第几页
 * @apiSuccess {Number} pages 总页数
 * @apiSuccess {Object[]} list 返回数组
 * @apiSuccessExample  {json} success-example
 * {
 * 	"list": [
 * 		{
 * 			"id": 1,
 * 			"type": 1,
 * 			"typeDetail": null,
 * 			"fileName": "测试",
 * 			"addTime": "2023-01-22T12:01:01.000Z",
 * 			"updateTime": "2023-01-22T12:01:03.000Z"
 * 		}
 * 	],
 * 	"total": 26,
 * 	"page": 1,
 * 	"limit": 1,
 * 	"pages": 26,
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.get('/query', (req, res, next) => {
    let {id = ''} = req.data
    let {page, limit, folderId = null, fileName = ''} = req.query
    page = parseInt(page)
    limit = parseInt(limit)
    page = page ? page : 1
    limit = limit ? limit : 20
    folderId = folderId ?? -1
    if (id) {
        file.getFileList(id, page, limit, folderId, fileName).then(data => {
            res.json(resJson(0, '成功', data))
        }).catch(err => {
            console.error("getFolder:", err)
            res.json(resJson(500, '系统内部错误'))
            logger.error(`"错误getFolder：", ${JSON.stringify(err)}`)

        })
    } else {
        res.json(resJson(-1, '失败，没有找到指定用户'))
    }
})

/**
 * @api {POST} /api/file/addFolder 新增文件夹
 * @apiGroup file
 * @apiDescription 按用户ID，父文件夹ID? 文件夹名称? 查询
 * @apiVersion 1.0.0
 *
 * @apiParam {String} folderName 文件夹名称
 * @apiParamExample {json} request-example
 * {
 *  "fileName": "fileName"
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"id": Number,
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.post('/addFolder', (req, res, next) => {
    let {folderName = "",folderId= -1} = req.body,
        {id = ""} = req.data
    if (!folderName || !id) {
        res.json(resJson(601, '失败，参数错误'))
    } else {
        file.addFolder({userId:id, folderName, folderId}).then(data => {
            res.json(resJson(0, '成功', {id: data.insertId}))
        }).catch(err => {
            console.error("addFolder:", err)
            res.json(resJson(500, '系统内部错误'))
            logger.error(`"错误addFolder：", ${JSON.stringify(err)}`)

        })
    }
})

// router.post('/addFile', (req, res, next) => {
//     let {folderName = "",folderId= -1} = req.body,
//         {id = ""} = req.data
//     if (!folderName || !id) {
//         res.json(resJson(601, '失败，参数错误'))
//     } else {
//         file.addFolder({userId:id, folderName, folderId}).then(data => {
//             res.json(resJson(0, '成功', {id: data.insertId}))
//         }).catch(err => {
//             console.error("addFolder:", err)
//             res.json(resJson(500, '系统内部错误'))
//         })
//     }
// })


/**
 * @api {POST} /api/file/addLabel 添加标签到文件
 * @apiGroup file
 * @apiDescription 给指定文件添加标签
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} fileId 文件ID
 * @apiParam {Number} labelId 标签ID
 * @apiParamExample {json} request-example
 * {
 *  "fileId": 123,
 *  "labelId": 456
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.post('/addLabel', (req, res, next) => {
    let {fileId, labelId} = req.body;
    let {id = ""} = req.data; // Assuming id is the userId
    if (!fileId || !labelId || !id) {
        res.json(resJson(601, '失败，参数错误'));
    } else {
        file.addLabelToItem(id, fileId, labelId)
            .then(() => {
                res.json(resJson(0, '成功'));
            })
            .catch(err => {
                console.error("addLabel:", err);
                res.json(resJson(500, '系统内部错误'));
                logger.error(`"错误addLabel：", ${JSON.stringify(err)}`)

            });
    }
});

/**
 * @api {POST} /api/file/removeLabel 从文件中删除标签
 * @apiGroup file
 * @apiDescription 从指定文件中删除标签
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} fileId 文件ID
 * @apiParam {Number} labelId 标签ID
 * @apiParamExample {json} request-example
 * {
 *  "fileId": 123,
 *  "labelId": 456
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.post('/removeLabel', (req, res, next) => {
    let {fileId, labelId} = req.body;
    let {id = ""} = req.data; // Assuming id is the userId
    if (!fileId || !labelId || !id) {
        res.json(resJson(601, '失败，参数错误'));
    } else {
        file.removeLabelFromItem(id, fileId, labelId)
            .then(() => {
                res.json(resJson(0, '成功'));
            })
            .catch(err => {
                console.error("removeLabel:", err);
                res.json(resJson(500, '系统内部错误'));
                logger.error(`"错误removeLabel：", ${JSON.stringify(err)}`)

            });
    }
});
/**
 * @api {POST} /api/file/addNewLabel 添加新标签
 * @apiGroup file
 * @apiDescription 添加新的标签
 * @apiVersion 1.0.0
 *
 * @apiParam {String} labelName 新的标签名称
 * @apiParamExample {json} request-example
 * {
 *  "labelName": "new label"
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.post('/addNewLabel', (req, res, next) => {
    let {labelName} = req.body;
    let {id = ""} = req.data; // Assuming id is the userId
    if (!labelName || !id) {
        res.json(resJson(601, '失败，参数错误'));
    } else {
        file.addNewLabel(id, labelName)
            .then(() => {
                res.json(resJson(0, '成功'));
            })
            .catch(err => {
                console.error("addNewLabel:", err);
                res.json(resJson(500, '系统内部错误'));
                logger.error(`"错误addNewLabel：", ${JSON.stringify(err)}`)

            });
    }
});


/**
 * @api {POST} /api/file/deleteLabel 删除标签
 * @apiGroup file
 * @apiDescription 删除标签
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} labelId 标签ID
 * @apiParamExample {json} request-example
 * {
 *  "labelId": 456
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.post('/deleteLabel', (req, res, next) => {
    let {labelId} = req.body;
    let {id = ""} = req.data; // Assuming id is the userId
    if (!labelId || !id) {
        res.json(resJson(601, '失败，参数错误'));
    } else {
        file.deleteLabel(id, labelId)
            .then(() => {
                res.json(resJson(0, '成功'));
            })
            .catch(err => {
                console.error("deleteLabel:", err);
                res.json(resJson(500, '系统内部错误'));
                logger.error(`"错误deleteLabel：", ${JSON.stringify(err)}`)
            });
    }
});
/**
 * @api {GET} /api/file/getLabels 查询标签列表
 * @apiGroup file
 * @apiDescription 查询用户的标签列表
 * @apiVersion 1.0.0
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.get('/getLabels', (req, res, next) => {
    let {id = ""} = req.data; // Assuming id is the userId
    if (!id) {
        res.json(resJson(601, '失败，参数错误'));
    } else {
        file.getLabels(id)
            .then(data => {
                res.json(resJson(0, '成功', {labels: data}));
            })
            .catch(err => {
                console.error("getLabels:", err);
                res.json(resJson(500, '系统内部错误'));
                logger.error(`"错误getLabels：", ${JSON.stringify(err)}`)
            });
    }
});
/**
 * @api {GET} /api/file/getFilesByLabel 查询标签文件
 * @apiGroup file
 * @apiDescription 根据标签ID查询文件
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} labelId 标签ID
 * @apiParamExample {json} request-example
 * {
 *  "labelId": 456
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.get('/getFilesByLabel', (req, res, next) => {
    let {labelId} = req.query;
    let {id = ""} = req.data; // Assuming id is the userId
    if (!labelId || !id) {
        res.json(resJson(601, '失败，参数错误'));
    } else {
        file.getFilesByLabel(id, labelId)
            .then(data => {
                res.json(resJson(0, '成功', {files: data}));
            })
            .catch(err => {
                console.error("getFilesByLabel:", err);
                res.json(resJson(500, '系统内部错误'));
                logger.error(`"错误getFilesByLabel：", ${JSON.stringify(err)}`)

            });
    }
});
/**
 * @api {POST} /api/file/updateQueryTime 更新文件查看时间
 * @apiGroup file
 * @apiDescription 按用户ID和文件ID更新查看时间
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} fileId 文件ID
 * @apiParamExample {json} request-example
 * {
 *  "fileId": 123
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.post('/updateQueryTime', (req, res, next) => {
    let {fileId} = req.body;
    let {id = ""} = req.data; // Assuming id is the userId
    if (!fileId || !id) {
        res.json(resJson(601, '失败，参数错误'));
    } else {
        file.updateQueryTime(id, fileId)
            .then(data => {
                res.json(resJson(0, '成功', {updated: true}));
            })
            .catch(err => {
                console.error("updateQueryTime:", err);
                res.json(resJson(500, '系统内部错误'));
                logger.error(`"错误updateQueryTime：", ${JSON.stringify(err)}`)

            });
    }
});

/**
 * @api {GET} /api/file/getRecentlyViewedFiles 获取最近七天查看过的文件列表
 * @apiGroup file
 * @apiDescription 按用户ID获取最近七天查看过的文件列表
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} page 页数
 * @apiParam {Number} limit 每页数量
 * @apiParamExample {json} request-example
 * {
 *  "page": 1,
 *  "limit": 20
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 *  "list": [],
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.get('/getRecentlyViewedFiles', (req, res, next) => {
    let {id = ''} = req.data; // Assuming id is the userId
    let {page, limit} = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    if (id) {
        file.getRecentlyViewedFiles(id, page, limit).then(data => {
            res.json(resJson(0, '成功', data))
        }).catch(err => {
            console.error("getRecentlyViewedFiles:", err);
            res.json(resJson(500, '系统内部错误'));
            logger.error(`"错误getRecentlyViewedFiles：", ${JSON.stringify(err)}`)

        })
    } else {
        res.json(resJson(-1, '失败，没有找到指定用户'));
    }
});
/**
 * @api {PUT} /api/file/removeAllQueryTimes 清除所有文件的查看时间
 * @apiGroup file
 * @apiDescription 根据用户ID清除所有文件的查看时间
 * @apiVersion 1.0.0
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.post('/removeAllQueryTimes', (req, res, next) => {
    let {id = ''} = req.data; // Assuming id is the userId
    if (id) {
        file.removeAllQueryTimes(id).then(() => {
            res.json(resJson(0, '成功'));
        }).catch(err => {
            console.error("removeAllQueryTimes:", err);
            res.json(resJson(500, '系统内部错误'));
            logger.error(`"错误removeAllQueryTimes：", ${JSON.stringify(err)}`)
        });
    } else {
        res.json(resJson(-1, '失败，没有找到指定用户'));
    }
});
/**
 * @api {POST} /api/file/updateFileName 修改文件名
 * @apiGroup file
 * @apiDescription 按用户ID和文件ID修改文件名
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} fileId 文件ID
 * @apiParam {String} fileName 新的文件名
 * @apiParamExample {json} request-example
 * {
 *  "fileId": 1,
 *  "fileName": "newFileName"
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.post('/updateFileName', (req, res, next) => {
    let {id = ''} = req.data; // Assuming id is the userId
    let {fileId, fileName} = req.body;
    fileId = parseInt(fileId);
    if (id && fileId && fileName) {
        file.updateFileName(id, fileId, fileName).then(() => {
            res.json(resJson(0, '成功'))
        }).catch(err => {
            console.error("updateFileName:", err);
            res.json(resJson(500, '系统内部错误'));
            logger.error(`"错误updateFileName：", ${JSON.stringify(err)}`)
        })
    } else {
        res.json(resJson(601, '失败，参数错误'));
    }
});
/**
 * @api {POST} /api/file/deleteFile 删除文件
 * @apiGroup file
 * @apiDescription 根据文件ID删除文件
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} fileId 文件ID
 * @apiParamExample {json} request-example
 * {
 *  "fileId": 123
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 500:系统内部错误，601:参数错误 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 * 	"errMsg": "成功",
 * 	"errNo": 0
 * }
 */
router.post('/deleteFile', (req, res, next) => {
    let {fileId} = req.body;
    let {id = ''} = req.data; // Assuming id is the userId
    if (!fileId || !id) {
        res.json(resJson(601, '失败，参数错误'));
    } else {
        file.deleteFile(id, fileId).then(() => {
            res.json(resJson(0, '成功'));
        }).catch(err => {
            console.error("deleteFile:", err);
            res.json(resJson(500, '系统内部错误'));
            logger.error(`"错误deleteFile：", ${JSON.stringify(err)}`)
        });
    }
});

export default router
