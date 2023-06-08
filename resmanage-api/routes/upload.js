import {resJson} from "../index.js";
import express from "express";
import fs from "fs";
import fileSql from "../sql/query/file.js";
const router = express.Router();
import path from "path";
import OSS from 'ali-oss'
import multer from "multer";

import ENV from "../config/index.js"
import logger from "../logs/index.js";

const client = new OSS({
    region: ENV.OSS_REGION,
    accessKeyId: ENV.ACCESS_KEY_ID,
    accessKeySecret: ENV.ACCESS_KEY_SECRET,
    bucket: ENV.OSS_BUCKET,
    secure: ENV.OSS_SECURE,
    endpoint: ENV.OSS_ENDPOINT,
    cname: ENV.OSS_CNAME
})


/**
 * 上传文件到阿里云OSS
 * @param fileName
 * @param filePath
 * @returns {Promise<unknown>}
 */
const putFile2Ali = (fileName, filePath) => new Promise((resolve, reject) => {
    const __dirName = path.resolve(filePath)
    client.put(`${fileName}`, path.normalize(__dirName)).then(res => {
        resolve(res.url)
    }).catch(err => {
        console.error("上传到阿里云失败", err)
        logger.error(`"上传到阿里云失败：", ${JSON.stringify(err)}`)
        reject(err)
    })
})

router.post('/upload', multer({dest: 'uploadFiles/'}).array('file'), async (req, res) => {
    let files = req.files, fileList = [];
    let {flag, folderId, typeList} = req.body
    typeList = typeList.split(',')
    let {id = ''} = req.data
    if (!id) {
        res.json(resJson(601, '系统检测到异常行为，已被拦截。'))
        return false
    }
    if (!files) {
        res.json(resJson(601, '参数错误'))
        return false
    }

    try {
        await files.reduce(async (memo, item, i) => {
            await memo
            let newName = 'RES-' + Date.now().toString() + '-' + item.originalname
            let newPath = "uploadFiles/" + newName
            fs.renameSync("uploadFiles/" + item.filename, newPath);
            let file = await putFile2Ali(newName, newPath)
            const filenameParts = item.originalname.split('.');
            const extension = filenameParts[filenameParts.length - 1];  // 获取到文件扩展名
            fileList.push({url:file,originalName:item.originalname,extension})
            if(flag==='default'){   // 如果flag是default 就调用上传文件接口
                try{
                    const sqlBack =  await fileSql.addFile({userId:id,
                        fileName:item.originalname,folderId,typeDetail:extension,filePath:file,type:typeList[i]})
                    fileList[fileList.length-1].id = sqlBack.insertId
                }catch (e) {
                    console.error("上传文件添加到数据库失败：", e)
                    logger.error(`"上传文件添加到数据库失败：", ${JSON.stringify(e)}`)
                }
            }
        }, undefined);
        res.json(resJson(0, '成功', {fileList}))
    } catch (e) {
        console.error("上传文件失败foreach：", e)
        res.json(resJson(500, '系统内部错误'))
        logger.error(`"上传文件失败foreach：", ${JSON.stringify(e)}`)
        return false
    }
})


export default router
