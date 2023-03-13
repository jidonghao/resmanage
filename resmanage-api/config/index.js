import dotenv from "dotenv"
import fs from "fs"
import chalk from "chalk";

const NODE_ENV = process.env.NODE_ENV
const dotenvFile = `.env.${NODE_ENV}`

if (fs.existsSync(dotenvFile)) {
    dotenv.config({
        path: dotenvFile
    })
}else{
    console.log(chalk.red('[error]: NODE_ENV设置错误或文件不存在'))
    throw "[error]: NODE_ENV设置错误或文件不存在"
}

export default process.env
