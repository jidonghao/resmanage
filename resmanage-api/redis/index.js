import {createClient} from 'redis';

const client = createClient({url: "redis://127.0.0.1:6379"});

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
