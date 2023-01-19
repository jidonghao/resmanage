/**
 * @description 权限存储函数
 */
const authorizationKey = 'authorization'

export function getAuthorization() {
    return uni.getStorageSync(authorizationKey)
}

export function setAuthorization(authorization:any) {
    return uni.setStorageSync(authorizationKey, authorization)
}

export function removeAuthorization() {
    return uni.removeStorageSync(authorizationKey)
}
