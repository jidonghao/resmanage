import Core from "@alicloud/pop-core"
import {accessKeyId, accessKeySecret} from "./sms-setting.js";

const client = new Core({
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
});
/**
 * 发送验证码
 * @param phoneNumber 手机号
 * @param code 验证码
 * @return {Promise<unknown>}
 */
export const smsSend = (phoneNumber, code) => new Promise((resolve, reject) => {
    client.request('SendSms', {
        "SignName": "dhxt资源管理系统",
        "TemplateCode": "SMS_268616149",
        "PhoneNumbers": phoneNumber,
        "TemplateParam": `{\"code\":\"${code}\"}`
    }, {
        method: 'POST',
        formatParams: false,
    }).then((result) => {
        result = JSON.stringify(result)
        if (result?.Message === "OK") {
            resolve(result)
        } else {
            reject(result)
        }
    }).catch(err => {
        reject(err)
    })
})
