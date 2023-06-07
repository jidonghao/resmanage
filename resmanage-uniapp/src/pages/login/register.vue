<template>
    <uni-popup ref="message" type="message">
        <uni-popup-message type="error" :message="messageText" :duration="2000"/>
    </uni-popup>
    <view class="container-login">
        <view class="selectUse">
            <!--    <view :class="{'useSelect':useSelect===1}" @click="useSelect=1">手机号登录</view>-->
            <!--    <view class="vBar">|</view>-->
            <!--    <view :class="{'useSelect':useSelect===2}" @click="useSelect=2">密码登录</view>-->
        </view>
        <!--  -->
        <view class="container loginView" >
            <uni-forms :modelValue="formData" label-width="100px">
                <uni-forms-item required label="用户名：" name="user">
                    <uni-easyinput :maxlength="11" v-model="formData.username" placeholder="请输入登录使用的用户名"/>
                </uni-forms-item>
                <uni-forms-item required label="昵称：" name="user">
                    <uni-easyinput :maxlength="11" v-model="formData.nickname" placeholder="请输入昵称"/>
                </uni-forms-item>
                <uni-forms-item required name="passwd" label="密码：">
                    <uni-easyinput type="password" v-model="formData.passwd" placeholder="请输入密码"/>
                </uni-forms-item>
                <uni-forms-item required name="passwd" label="确认密码：">
                    <uni-easyinput type="password" v-model="formData.rePasswd" placeholder="请再次输入密码"/>
                </uni-forms-item>
            </uni-forms>
        </view>
        <button @click="register" class="login">注册</button>
        <button size="mini" class="login register" @click="goLogin">已有账号？立即登录➡️</button>
    </view>
</template>

<script setup lang="ts">
import {ref, unref} from 'vue'
import loginApi from '@/api/login'
import {setAuthorization} from "@/utils/auth";

function goLogin(){
    uni.navigateTo({
        url:"/pages/login/login"
    })
}

let formData = ref({username: '',nickname: '',  captcha: '', passwd: '', rePasswd: ""})
let useSelect = ref(2)
let captchaPlaceHolder = ref("获取验证码")  // 验证码按钮
let captchaDis = ref(false),messageText = ref("")
const message = ref<any>()
/**
 * 表单验证
 * @param phone
 * @param captcha
 * @param passwd
 */
let verification = (phone = false, captcha = false, passwd = false) => {
    if (phone) {
        if (!formData.value.username) {
            messageText.value = "请先输入用户名"
            message.value.open()
            return false
        } else  if (!formData.value.nickname) {
            messageText.value = "请输入昵称"
            message.value.open()
            return false
        } else if(!formData.value.passwd){
            messageText.value = "请输入密码"
            message.value.open()
            return false
        }else if(formData.value.passwd!==formData.value.rePasswd){
            messageText.value = "两次输入密码不一致"
            message.value.open()
            return false
        }else if(formData.value.passwd.length<8){
            messageText.value = "密码太简单了"
            message.value.open()
            return false
        }
    }
    if (captcha) {
        if (!formData.value.captcha) {
            uni.showToast({title: '请输入验证码', icon: 'error'})
            return false
        }
        if (formData.value.captcha.length !== 4) {
            uni.showToast({title: '验证码错误', icon: 'error'})
            return false
        }
        // if (!formData.value.invitationCode) {
        //   uni.showToast({title: '请先输入邀请码', icon: 'error'})
        //   return false
        // }
    }

    if (passwd) {
        if (!formData.value.passwd) {
            uni.showToast({title: '请输入密码', icon: 'error'})
            return false
        } else if (formData.value.passwd.length < 8) {
            uni.showModal({title: '提示',content:"用户名或密码错误",showCancel:false})
            return false
        }
    }

    return true
}
/**
 * 获取验证码
 */
// let getCaptcha = () => {
//     if (!verification(true))
//         return false
//     // 获取验证码
//
//     let captchaTimeStorage = +uni.getStorageSync('captchaTime') || null
//     // if (captchaTimeStorage && new Date().getTime() - captchaTimeStorage < 300000) {
//     //   uni.showModal({title: "错误", content: "非法操作，已拦截", showCancel: false})
//     //   return false
//     // }
//     loginApi.getCode({phoneNumber: formData.value.phoneNumber}).then(() => {
//         uni.showToast({title: '成功发送', icon: 'success'})
//         captchaDis.value = true
//         captchaPlaceHolder.value = `60秒重新获取`
//
//         uni.setStorageSync('captchaTime', new Date().getTime())
//
//         let time = 59,
//             captchaTime = setInterval(() => {
//                 captchaPlaceHolder.value = `${time--}秒重新获取`
//                 if (time === 0) {
//                     clearInterval(captchaTime)
//                     captchaDis.value = false
//                     captchaPlaceHolder.value = "重新获取"
//                 }
//             }, 1e3)
//     }).catch((err: any) => {
//         uni.showModal({title: "提示", content: err.errMsg || '操作失败，请重试', showCancel: false})
//     })
// }
/**
 * 注册
 */
let register = () => {
    if (!verification(true, useSelect.value === 1, useSelect.value === 2)) {
        return false
    }
    loginApi.register({ ...unref(formData)}).then((res: any) => {
        setAuthorization(res.token)
        uni.setStorageSync('userInfo', res.info)
        uni.reLaunch({url: "/pages/recent/recent"})
    }).catch((err: any) => {
        uni.showModal({title:"提示",content: err.errMsg || "系统繁忙，请稍后再试", showCancel: false})
    }).finally(() => {
        uni.hideLoading()
    })

}

</script>

<style scoped lang="scss">
.loginView {
  background: #fefefe;
}

.getCaptcha {
  display: flex;
  justify-content: center;
  align-items: center;

  .getCaptchaBtn {
    font-size: 24upx;
    padding: 2upx 16upx;
    margin-left: 18upx;
    color: #161616;
  }
}

.selectUse {
  user-select: none;
  padding: 120upx 0 80upx;
  display: flex;
  width:100%;
  align-items: center;
  justify-content: center;
  font-size: 32upx;
  color: rgba(17, 17, 17, 0.8);

  .vBar {
    margin: 0 24upx;
  }
}

.useSelect {
  color: dodgerblue;
}

.login {
  margin: 0 30upx;
  background: #f5f5f5;
  color: #181818;
}
.register{
  margin-top: 20rpx;
  background: #f5f5f5;
  color: #1B1A1A;
  position: absolute;
  right: 0;
}
.container-login{
  width: 750rpx;
  margin: 0 auto;
  position: relative;
}
</style>