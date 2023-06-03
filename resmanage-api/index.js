import express from 'express'
import expressJwt from 'express-jwt'
import {signKey} from './tools/token.js'
import bodyParser from 'body-parser'
import {verToken} from "./tools/token.js"
import path from "path"
import {fileURLToPath} from 'url'
import router from "./routes/index.js"
import config from "./config/index.js"
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const resJson = (errNo, errMsg, data) => ({...data, errMsg, errNo})
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use("/apiDoc", express.static(path.join(__dirname + '/apiDoc')))   // api文档


// 为 /public 设置静态文件服务
app.use(express.static(path.join(__dirname, 'public')))

// 当用户访问根目录时返回 index.html 文件
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

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
    path: [
        '/api/user/login',
        '/api/user/getCode',
        '/api/user/loginByCode',
        '/apidoc',
        /^((?!\/api).)*$/ // 匹配所有非 /api 开头的路径
    ]
}));

//当token失效返回提示信息
app.use(function (err, req, res, next) {
    if (err.status === 401) {
        return res.status(501).json(resJson(501, '请先登录'));
    }
});

app.use("/api", router)

// app.get("/", (request, response) => {
//     response.json(1)
// })

app.use("*", (req, res, next) => {
    res.status(404).json(resJson(404, "接口不存在", {path: req._parsedUrl.path}))
})
app.listen(8080, () => {
    console.log(chalk.blue("\n服务已经启动，8080端口监听中..."))
})

