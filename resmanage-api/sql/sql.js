import mysql from 'mysql'
// 数据库配置在此文件
import sqlSetting from './sql-setting.js'

let pool = mysql.createPool({
    connectionLimit: 10,
    ...sqlSetting
    // host:sqlSetting.,  user,			//默认情况下的用户名
    // password, database			//连接的数据库名字
})

/***
 * sql
 * @param sql
 * @param data
 * @returns {Promise<unknown>}
 */
function sql(sql, data = []) {
    return new Promise((resolve, reject) => {
        pool.query(sql, data, function (error, results) {
            if (error) {
                reject(error.message)
            } else {
                resolve(results)
            }
        })
    })
}

export default sql
