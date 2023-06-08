import baseUrl from "../../baseUrl";


export const request = ( url: string, method: 'POST' | 'GET', data?: Object|null) => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: baseUrl + url,
            method: method || 'GET',
            data: data || {},
            header: {
                'authorization': uni.getStorageSync('authorization') || ''
            },
            success: (res:any) => {
                if(res.data?.errNo!==0){
                    switch (res.data?.errNo){
                        case 501:
                            uni.navigateTo({url:'/pages/login/login'})
                            break
                        default:
                            reject(res.data)
                            break
                    }
                }else{
                    resolve(res.data)
                }
            },
            fail: (err:any) => {
                reject({errMsg:'网络错误，请稍后再试'})
            }
        })
    })
}
