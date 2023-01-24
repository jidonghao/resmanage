import express from "express"
const router = express.Router()

import user from "./user.js"
import file from "./file.js"
import {resJson} from "../index.js";

router.use('/user',user);
router.use('/file',file);

router.get('/getTime', (req, res, next) => {
    res.json(resJson(0, '成功', {time: new Date().getTime()}))
})

export default router