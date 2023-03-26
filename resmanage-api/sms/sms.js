import Core from "@alicloud/pop-core"
import ENV from '../config/index.js'

const client = new Core({
        accessKeyId: ENV.ACCESS_KEY_ID,
        accessKeySecret: ENV.ACCESS_KEY_SECRET,
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25'
    }), SIGN_NAME = ENV.SMS_SIGN_NAME,
    TEMPLATE_CODE = ENV.SMS_TEMPLATE_CODE


/**
 * 发送验证码
 * @param phoneNumber 手机号
 * @param code 验证码
 * @return {Promise<unknown>}
 */
export const smsSend = (phoneNumber, code) => new Promise((resolve, reject) => {
    client.request('SendSms', {
        "SignName": SIGN_NAME,
        "TemplateCode": TEMPLATE_CODE,
        "PhoneNumbers": phoneNumber,
        "TemplateParam": `{\"code\":\"${code}\"}`
    }, {
        method: 'POST',
        formatParams: false,
    }).then((result) => {
        resolve(JSON.stringify(result))
    }).catch(err => {
        reject(err)
    })
})
