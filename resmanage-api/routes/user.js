import express from "express";
import login from "../sql/query/login.js";
import {setToken} from "../tools/token.js";
import {resJson} from "../index.js";
// import {smsSend} from "../sms/sms.js";
// import {getKey, setKey} from "../redis/index.js";
import logger from "../logs/index.js"
const router = express.Router();
import CryptoJS from "crypto-js";
import ENV from "../config/index.js"


/**
 * @api {POST} /api/user/register 注册
 * @apiGroup user
 * @apiDescription 用于用户注册
 * @apiVersion 1.0.0
 * @author openai gpt-3.5-turbo 20230323
 */
router.post('/register', async (req, res, next) => {
    let {passwd, username, nickname} = req.body;
    if (!username ||!passwd || !nickname ) {
        res.json(resJson(601, '参数不对'))
    } else if (passwd.length < 6 || passwd.length > 20|| username.length < 1 || username.length > 20) {
        res.json(resJson(600, 'error'))
    } else {
        try {
            // check if the username already exists
            let userExists = await login.checkUserExists(username);
            if(userExists) {
                res.json(resJson(601, '用户名已存在，请换一个试试'));
                return;
            }

            passwd = CryptoJS.AES.encrypt(passwd, ENV.PASSWORD_KEY).toString()
            let sqlBack = await login.createUser(username, nickname, passwd);
            setToken(username, sqlBack.insertId).then(async (data) => {
                res.json(resJson(0, '登录成功', {
                    token: data,
                    params: ['./*', '*', '&^%$'],
                    info: {
                        nickName: nickname,
                        userName: username,
                        hasPasswd: true,
                        avatar:ENV.DEFAULT_AVATAR
                    }
                }));
            }).catch((e) => {
                res.status(400).json(resJson(500, '系统繁忙，请稍后重试'));
                console.log("用户注册错误？：：", e)
                logger.error(`用户注册后免登陆设置token/清空验证码错误：${JSON.stringify(e)}`)
            })
        } catch (err) {
            res.status(400).json(resJson(500, 'error'));
            console.error("从redis通过手机号获取验证码错误(几乎不会错误，除非redis)：", err);
            logger.error(`从redis通过手机号获取验证码错误(几乎不会错误，除非redis)：${JSON.stringify(err)}`)
        }
    }
});


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
    let {user, passwd} = req.body;
    if (!user && !passwd) {
        res.json(resJson(601, '参数不对'))
    } else if (!user || passwd.length < 6 || passwd.length > 20) {
        res.json(resJson(600, '账号或密码错误'))
    } else {
        login.queryByUsername(user, passwd).then(data => {
            if(!data||(data instanceof Array && data.length===0)){
                res.json(resJson(600, '账号或密码错误'))
                return new Promise(()=>{})
            }
            let sqlBack = data[0],
                password = CryptoJS.AES.decrypt(sqlBack?.passwd, ENV.PASSWORD_KEY).toString(CryptoJS.enc.Utf8) + ''
            if (passwd === password && user === sqlBack?.username) {
                setToken(sqlBack?.user, sqlBack?.id).then((data) => {
                    res.json(resJson(0, '登录成功', {
                        token: data,
                        params: ['./*', '*', '&^%$'],
                        info: {
                            user: sqlBack?.user,
                            nickName: sqlBack?.nick_name,
                            identity: sqlBack?.identity,
                            avatar: sqlBack?.avatar,
                            hasPasswd: true
                        }
                    }));
                })
            } else {
                res.json(resJson(600, '账号或密码错误'))
            }
        }).catch(err => {
            console.error(err)
            res.json(resJson(500, '系统内部错误'))
        })
    }
});

/**
 * @api {POST} /api/user/loginByCode 通过验证码登录
 * @apiGroup user
 * @apiDescription 用于手机号+验证码登录
 * @apiVersion 1.0.0
 *
 * @apiParam {String} phoneNumber 手机号
 * @apiParam {String} code 密码
 * @apiParamExample {json} request-example
 * {
 *  "phoneNumber": "13212345678",
 *  "code": "1234",
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
 *   "errNo": 0,
 *   isNew?:Boolean
 * }
 */
// router.post('/loginByCode', (req, res, next) => {
//     let {phoneNumber, code, invitationCode} = req.body, userName = ""
//     // if (invitationCode !== "DHXT2023") {
//     //     res.json(resJson(601, '邀请码错误'))
//     //     return false
//     // }
//     getKey(phoneNumber).then(value => {
//         if (code === value) {
//             return Promise.resolve()
//         } else {
//             res.json(resJson(601, '验证码错误'))
//             return Promise.reject("验证码错误")
//         }
//     }).then(() => {
//         return login.queryByPhoneNumber(phoneNumber).then(data => {
//             let sqlBack = data[0]
//             if (sqlBack) {
//                 setToken(sqlBack?.phone_number, sqlBack?.id).then((data) => {
//                     res.json(resJson(0, '登录成功', {
//                         token: data,
//                         params: ['./*', '*', '&^%$'],
//                         info: {
//                             phoneNumber: sqlBack?.phone_number,
//                             nickName: sqlBack?.nick_name,
//                             identity: sqlBack?.identity,
//                             avatar: sqlBack?.avatar,
//                             hasPasswd: !!sqlBack?.passwd
//                         }
//                     }));
//                 })
//                 return new Promise(() => {
//                 }) // 已完成 结束
//             } else {
//                 return Promise.resolve(1)   // 无该用户 去创建
//             }
//         }).catch(err => {
//             console.error("通过验证码登录sql错误：", err)
//         })
//     }).then(() => {
//         userName = `用户_${Math.floor(Math.random() * 100000000)}`
//         createUser({phoneNumber, userName},res)
//     }).catch(err => {
//         console.error("通过验证码登录错误：", err)
//         logger.error(`"通过验证码登录错误：", ${JSON.stringify(err)}`)
//         res.json(resJson(500, '系统内部错误'))
//     })
// })
function createUser({phoneNumber, userName},res){
    login.createUser(phoneNumber, userName).then(data=>{
        console.log("创建一个新用户：", phoneNumber, data.insertId)
        logger.info(`--------------\n创建一个新用户：\n, ${phoneNumber}, ${data.insertId}\n\n`)
        setToken(phoneNumber, data.insertId).then((data) => {
            res.json(resJson(0, '登录成功', {
                token: data,
                params: ['./*', '*', '&^%$'],
                info: {
                    phoneNumber,
                    nickName: userName,
                    identity: 1,
                    avatar: "https://oss.dhxt.fun/avatar_rabbit.png",
                    hasPasswd: false
                },
                isNew: true
            }));
        })
    }).catch(err => {
        console.log("通过验证码登录setToken错误：", err)
        logger.error(`"通过验证码登录setToken错误：", ${JSON.stringify(err)}`)
    })
}

const getCode = () => {
    return Array.from(
        {length: 4},
        () => Math.floor(Math.random() * 10)
    ).join('')
}
/**
 * @api {POST} /api/user/getCode 获取登录验证码
 * @apiGroup user
 * @apiDescription 用于获取登录验证码
 * @apiVersion 1.0.0
 *
 * @apiParam {String} phoneNumber 手机号
 * @apiParamExample {json} request-example
 * {
 *  "phoneNumber": "13212345678",
 * }
 *
 * @apiSuccess {String} errMsg 错误信息
 * @apiSuccess {String} errNo 602:拦截 0:成功
 * @apiSuccessExample  {json} success-example
 * {
 *   "errMsg": "成功"
 *   "errNo": 0
 * }
 */
// router.post('/getCode', (req, res, next) => {
//     let {phoneNumber} = req.body;
//     if (!phoneNumber) {
//         res.json(resJson(601, '系统检测到异常行为，已被拦截。'))
//         return false
//     }
//     if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(phoneNumber)) {
//         res.json(resJson(602, '系统检测到异常行为，已被拦截。'))
//         return false
//     }
//
//     getKey(phoneNumber).then(value => {
//         if (value) {
//             res.json(resJson(603, '已发送短信验证码，请勿重复获取，注意查收'))
//             return Promise.reject("系统中存在对应验证码，属重复请求，已拒绝")
//         } else {
//             return Promise.resolve()
//         }
//     }).then(() => {
//         let code = getCode()
//         //测试代码
//         // setKey(phoneNumber, code).then(() => {
//         //     res.json(resJson(0, '成功', {code}))
//         // }).catch(err => {
//         //     console.error("发送验证码错误：", err)
//         //     res.json(resJson(604, '系统检测到异常行为，已被拦截。'))
//         // })
//
//         /**
//          * 调用发送短信
//          */
//         smsSend(phoneNumber, code).then(() => {
//             return setKey(phoneNumber, code)
//         }).then(() => {
//             res.json(resJson(0, '成功'))
//         }).catch(err => {
//             console.error("发送验证码错误：", err)
//             res.json(resJson(604, '暂时无法获取短信'))
//             logger.error(`"发送验证码错误：", ${JSON.stringify(err)}`)
//         })
//     }).catch(err => {
//         console.error("redis ERROR：", err)
//     })
// })

router.post('/changePasswd', (req, res, next) => {
    let {passwd, passwdOld} = req.body;
    let {id = ''} = req.data
    if (!id) {
        res.json(resJson(602, '非法操作，已被拦截'))
        return false
    }
    if (!passwd) {
        res.json(resJson(601, '参数不对'))
        return false
    }
    passwd =  CryptoJS.AES.encrypt(passwd, ENV.PASSWORD_KEY).toString()
    login.changePasswd(id, passwdOld, passwd).then(data => {
        res.json(resJson(0, '成功'))
    }).catch(err => {
        if (err === "密码错误") {
            res.json(resJson(603, '原密码错误，请重新输入'))
        } else {
            console.error("修改密码错误：", err)
            logger.error(`"修改密码错误：", ${JSON.stringify(err)}`)
            res.json(resJson(500, '系统内部错误'))
        }
    })
})

// router.post('/changeNumber', (req, res) => {
//     let {phoneNumber, code} = req.body;
//     let {id = ''} = req.data
//     if (!phoneNumber || !code || !id) {
//         res.json(resJson(601, '系统检测到异常行为，已拦截。'))
//         return false
//     }
//     if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(phoneNumber)) {
//         res.json(resJson(602, '系统检测到异常行为，已拦截。'))
//         return false
//     }
//
//     getKey(phoneNumber).then(value => {
//         if (code === value) {
//             return Promise.resolve()
//         } else {
//             res.json(resJson(601, '验证码错误'))
//             return new Promise(() => {
//             })
//         }
//     }).then(() => {
//         login.changeNumber(phoneNumber, id).then(() => {
//             res.json(resJson(0, '成功'))
//         }).catch(err => {
//             res.json(resJson(500, '系统内部错误'))
//             console.error("修改手机号SQL出错：", err)
//             logger.error(`"修改手机号SQL出错：", ${JSON.stringify(err)}`)
//         })
//     }).catch(err => {
//         res.json(resJson(500, '系统内部错误'))
//         console.error("修改手机号出错：", err)
//         logger.error(`"修改手机号出错：", ${JSON.stringify(err)}`)
//     })
//
// })

router.post('/changeNickname', (req, res) => {
    let {nickname} = req.body;
    let {id = ''} = req.data
    if (!id||!nickname) {
        res.json(resJson(601, '系统检测到异常行为，已被拦截。'))
        return false
    }
    login.changeNickname(nickname, id).then(() => {
        res.json(resJson(0, '修改成功'))
    }).catch(err => {
        res.json(resJson(500, '系统内部错误'))
        console.error("修改昵称SQL错误：", err)
        logger.error(`"修改昵称SQL错误：", ${JSON.stringify(err)}`)
    })
})
router.post('/changeAvatar', (req, res) => {
    let {avatar} = req.body;
    let {id = ''} = req.data
    if (!id||!avatar) {
        res.json(resJson(601, '系统检测到异常行为，已被拦截。'))
        return false
    }
    login.changeAvatar(avatar, id).then(() => {
        res.json(resJson(0, '修改成功'))
    }).catch(err => {
        res.json(resJson(500, '系统内部错误'))
        console.error("修改头像SQL错误：", err)
        logger.error(`"修改头像SQL错误：", ${JSON.stringify(err)}`)
    })
})
export default router
