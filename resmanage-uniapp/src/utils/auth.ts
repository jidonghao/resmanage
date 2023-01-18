/**
 * @description 权限存储函数
 */
const authorizationKey = 'Authorization'

export function getAuthorization() {
    return uni.getStorageSync(authorizationKey)
}

export function setAuthorization(authorization:any) {
    return uni.setStorageSync(authorizationKey, authorization)
}

export function removeAuthorization(authorization:any) {
    return uni.removeStorageSync(authorizationKey)
}
