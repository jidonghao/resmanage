import express from 'express'
import sql from './sql/sql.js'
import tools from "./tools/tools.js";
import multer from 'multer'
import fs from 'fs'
import expressJwt from 'express-jwt'
const app = express()
import bodyParser from 'body-parser'
import {verToken,setToken} from "./public/token.js";

let resJson = (errNo,errMsg,data)=>({...data,errMsg,errNo})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
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
app.use(expressJwt({
    secret: 'mes_qdhd_mobile_xhykjyxgs',
    algorithms: ['HS256']
}).unless({
    path: ['/login']//除了这个地址，其他的URL都需要验证
}));
//当token失效返回提示信息
app.use(function (err, req, res, next) {
    if (err.status === 401) {
        return res.status(501).json(resJson(501,'请先登录'));
    }
});


app.get("/", (request, response) => {
    response.json({errMsg: `请先登录`})
})

app.post('/login', (req, res, next) =>{
    let {username, password} = req.body;
    console.log(req.body)
    if(!username&&!password){
        res.json(resJson(601,'参数不对'))
    }else if(username.length<6||username.length>20||password.length<6||password.length>20){
        res.json(resJson(600,'账号密码错误'))
    }else{
        //生成token
        setToken(username,password).then((data)=>{
            res.json(resJson(0,'登录成功', {token:data}));
        })
    }
});

app.listen(8080, () => {
    console.log("服务已经启动，8080端口监听中...")
})

