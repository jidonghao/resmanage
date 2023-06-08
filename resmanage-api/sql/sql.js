import mysql from 'mysql'
import ENV from "../config/index.js"
let pool = mysql.createPool({
    connectionLimit: 10,
    host:ENV.DB_HOST,
    user:ENV.DB_USER,
    password:ENV.DB_PASSWORD,
    database:ENV.DB_DATABASE
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
