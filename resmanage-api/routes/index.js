import express from "express"
const router = express.Router()

import user from "./user.js"
import file from "./file.js"
import upload from "./upload.js"
import {resJson} from "../index.js";

router.use('/user',user);
router.use('/file',file);
router.use('/upload',upload);

router.get('/getTime', (req, res, next) => {
    res.json(resJson(0, '成功', {time: new Date().getTime()}))
})

export default router
