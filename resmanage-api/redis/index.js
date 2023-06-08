import {createClient} from 'redis';
import ENV from '../config/index.js'

const client = createClient({
    url: `redis://${ENV.REDIS_URL}:${ENV.REDIS_PORT}`,
    password:ENV.REDIS_PASSWORD
});

client.on("error", function (err) {
    console.error("redis初始化失败：" + err);
});

await client.connect();

/**
 * 设置key
 * @param key
 * @param value
 * @param EX 超时时间
 * @return {Promise<String>}
 */
export const setKey = (key, value, EX = 300) => client.set(key, value, {EX})

/**
 * 通过key获取value
 * @param key
 * @return {Promise<String>}
 */
export const getKey = (key) => client.get(key)


/**
 * setKey("aaa","123",10).then(res=>{
 *     console.log(res)
 * }).catch(err=>{
 *     console.error(1,err)
 * })
 *
 * getKey("aaa").then(res=>{
 *     console.log(res)
 * }).catch(err=>{
 *     console.log(err)
 * })
 */
