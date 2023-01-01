import mysql from 'mysql'
let pool = mysql.createPool({
    connectionLimit: 10,
    host: '',
    user: '',			//默认情况下的用户名
    password: '',		//安装时设置的密码
    database: ''			//连接的数据库名字
})
/***
 * 查表
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