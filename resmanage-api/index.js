import express from 'express'
import sql from './sql/sql.js'
import tools from "./tools/tools.js";
import multer from 'multer'
import fs from 'fs'

const app = express()
import bodyParser from 'body-parser'


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

app.get("/", (request, response) => {
    response.send(`系统正在升级请稍后再试！`)
})

app.listen(8001, () => {
    console.log("服务已经启动，8011端口监听中...")
})

