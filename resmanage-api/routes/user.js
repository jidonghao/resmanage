import express from "express";
import login from "../sql/query/login.js";
import {setToken} from "../tools/token.js";
import {resJson} from "../index.js";
import {smsSend} from "../sms/sms.js";

const router = express.Router();

/**
 * @api {POST} /api/user/login 登录
 * @apiGroup user
 * @apiDescription 用于手机号+密码登录
 * @apiVersion 1.0.0
 *
 * @apiParam {String} phoneNumber 手机号
 * @apiParam {String} passwd 密码
 * @apiParamExample {json} request-example
 * {
 *  "phoneNumber": "13212345678",
 *  "passwd": "12345678",
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 600:手机号或密码错误，601:参数错误 0:成功
 * @apiSuccess {String} phoneNumber 手机号
 * @apiSuccess {Boolean} hasPasswd 是否设置密码
 * @apiSuccess {String} avatar 头像
 * @apiSuccess {Number} identity 身份
 * @apiSuccess {String} nickName 昵称
 * @apiSuccessExample  {json} success-example
 * {
 *   "phoneNumber": "13245678978",
 *   "hasPasswd": true
 *   "avatar": "https://xxxx"
 *   "identity": 9,
 *   "nickName": "昵称"
 *   "errMsg": "成功"
 *   "errNo": 0
 * }
 */
router.post('/login', (req, res, next) => {
    let {phoneNumber, passwd} = req.body;
    if (!phoneNumber && !passwd) {
        res.json(resJson(601, '参数不对'))
    } else if (phoneNumber.length !== 11 || passwd.length < 6 || passwd.length > 20) {
        res.json(resJson(600, '手机号或密码错误'))
    } else {
        login.loginByPasswd(phoneNumber, passwd).then(data => {
            let sqlBack = data[0]
            if (passwd === sqlBack?.passwd && phoneNumber === sqlBack?.phone_number) {
                setToken(sqlBack?.phone_number, sqlBack?.id).then((data) => {
                    res.json(resJson(0, '登录成功', {
                        token: data,
                        params: ['./*', '*', '&^%$'],
                        info: {
                            phoneNumber: sqlBack?.phone_number,
                            nickName: sqlBack?.nick_name,
                            identity: sqlBack?.identity,
                            avatar: sqlBack?.avatar,
                            hasPasswd: !!sqlBack?.passwd
                        }
                    }));
                })
            } else {
                res.json(resJson(600, '手机号或密码错误'))
            }
        }).catch(err => {
            console.error(err)
            res.json(resJson(500, '系统内部错误'))
        })
    }
});

const getCode = () => {
    return Array.from(
        {length: 4},
        () => Math.floor(Math.random() * 10)
    ).join('')
}

router.post('/getCode', (req, res, next) => {
    let {phoneNumber} = req.body;
    if (!phoneNumber) {
        res.json(resJson(602, '系统检测到异常行为，已被拦截。'))
        return false
    }
    if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(phoneNumber)) {
        res.json(resJson(602, '系统检测到异常行为，已被拦截。'))
        return false
    }

    

    // smsSend(phoneNumber, getCode()).then(res => {
    //     res.json(resJson(0, '成功'))
    // }).catch(err => {
    //     res.json(resJson(602, '系统检测到异常行为，已被拦截。'))
    // })
})

export default router