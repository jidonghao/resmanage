import express from 'express'
// import sql from './sql/sql.js'
// import tools from "./tools/tools.js";
// import multer from 'multer'
// import fs from 'fs'
import expressJwt from 'express-jwt'
import login from './sql/query/login.js'
import {signKey} from './tools/token.js'
import bodyParser from 'body-parser'
import {verToken, setToken} from "./tools/token.js";
import file from "./sql/query/file.js";

export const resJson = (errNo, errMsg, data) => ({...data, errMsg, errNo})
export const app = express()
import path from "path"
import {fileURLToPath} from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use("/apiDoc", express.static(path.join(__dirname + '/apiDoc')))   // api文档


// 允许跨域
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
    res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
    next();
});

// 权限配置
// 解析token获取用户信息
app.use((req, res, next) => {
    let token = req.headers['authorization'];
    if (token === undefined) {
        return next();
    } else {
        verToken(token).then((data) => {
            req.data = data;
            return next();
        }).catch((error) => {
            return next();
        })
    }
});
//验证token是否过期并规定哪些路由不用验证
app.use(expressJwt({secret: signKey, algorithms: ['HS256']}).unless({
    path: ['/', '/login', '/apiDoc', '/apidoc']//除了这个地址，其他的URL都需要验证
}));
//当token失效返回提示信息
app.use(function (err, req, res, next) {
    // console.log(err)
    if (err.status === 401) {
        return res.status(501).json(resJson(501, '请先登录'));
    }
});
/**
 *
 * @query {post} /login 登录
 * @apiName 登录
 * @apiGroup /
 * @apiDescription 登录
 * @apiVersion  1.0.0
 *
 * @apiParam {String} id=''
 *
 * @apiParamExample  {type} Request-Example:
 * {
 *     id: 1
 * }
 *
 * @apiSuccess {Number} code 200
 * @apiSuccess {Object} data 用户信息
 */
app.post('/login', (req, res, next) => {
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


app.get("/", (request, response) => {
    console.log(11)
    response.json(1)
})



/* 文件夹相关  begin 👇 */
/**
 * 新增文件夹
 */
app.post('/file/addFolder', (req, res, next) => {
    let {folderName = ""} = req.body,
        {id = ""} = req.data
    if (!folderName || !id) {
        res.json(resJson(-2, '失败，参数错误'))
    } else {
        file.addFolder(id, folderName).then(data => {
            res.json(resJson(0, '成功', {id: data.insertId}))
        }).catch(err => {
            console.error("addFolder:", err)
            res.json(resJson(500, '系统内部错误'))
        })
    }
})
/**
 * 查询
 * id,page,limit,folderId,fileName
 */
app.get('/file/query', (req, res, next) => {
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


/* 文件夹相关  end   👆 */


// 获取时间
app.get('/getTime', (req, res, next) => {
    res.json(resJson(0, '成功', {time: new Date().getTime()}))
})

app.use('*', (req, res) => {
    res.status(404).json({
        code: 404,
        message: '404'
    });
});
app.listen(8080, () => {
    console.log("服务已经启动，8080端口监听中...")
})

