import file from "../sql/query/file.js";
import {resJson} from "../index.js";
import express from "express";
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
    let {folderName = ""} = req.body,
        {id = ""} = req.data
    if (!folderName || !id) {
        res.json(resJson(601, '失败，参数错误'))
    } else {
        file.addFolder(id, folderName).then(data => {
            res.json(resJson(0, '成功', {id: data.insertId}))
        }).catch(err => {
            console.error("addFolder:", err)
            res.json(resJson(500, '系统内部错误'))
        })
    }
})


export default router