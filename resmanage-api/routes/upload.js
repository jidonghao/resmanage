import {resJson} from "../index.js";
import express from "express";
import fs from "fs";
const router = express.Router();
import {accessKeySecret, accessKeyId} from "../sms/sms-setting.js";
import path from "path";
import OSS from 'ali-oss'
import multer from "multer";
// import Busboy from "busboy"

const client = new OSS({
    region: 'oss-cn-beijing',
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    bucket: 'jdh-bucket',
    secure: true,
    endpoint: "oss.dhxt.fun",
    cname: true
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
        reject(err)
    })
})

router.post('/upload', multer({dest: 'uploadFiles/'}).array('file'), async (req, res) => {
    let files = req.files, fileList = [];
    let {id = ''} = req.data
    if (!id) {
        res.json(resJson(601, '系统检测到异常行为，已被拦截。'))
        return false
    }
    if (!files) {
        res.json(resJson(601, '参数错误'))
        return false
    }

    try{
        await files.reduce(async (memo, item) => {
            await memo
            let newName = 'RES-' + Date.now().toString() + '-' + item.originalname
            let newPath = "uploadFiles/" + newName
            fs.renameSync("uploadFiles/" + item.filename, newPath);
            let file = await putFile2Ali(newName, newPath)
            fileList.push(file)
        }, undefined);
        res.json(resJson(0, '成功', {fileList}))
    }catch (e) {
            console.error("上传文件失败foreach：",e)
            res.json(resJson(500, '系统内部错误'))
            return false
    }
})


export default router
