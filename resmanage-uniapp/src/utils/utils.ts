import {getAuthorization} from "@/utils/auth";

/**
 * Modal
 * @param options
 * @return {Promise<null>}
 */
export let showModal = (options:any|null) => new Promise((resolve, reject) => {
    options.title = options.title || "提示"
    uni.showModal({
        ...options,
        success(res) {
            if (res.confirm) {
                resolve(void 0)
            } else if (res.cancel) {
                reject()
            }
        }
    })
})

/**
 * 检测是否登录状态
 */

export function checkLogin(){
    if (!getAuthorization()) {
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        uni.navigateTo({
            url: "/pages/login/login"
        })
        return false
    }
}
