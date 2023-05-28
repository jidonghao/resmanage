import baseUrl from "../../baseUrl";
import eventBus from "@/utils/event-bus";

export const uploadFile = (files: UniApp.UploadFileOptionFiles[], flag:'default'|'avatar',
                           options:any) =>
    new Promise((resolve, reject) => {
    const uploadTask =  uni.uploadFile({
        url: baseUrl + "api/upload/upload",
        files,
        name: 'files',
        header: {
            'authorization': uni.getStorageSync('authorization') || ''
        },
        formData: {
            'user': 'test', flag, folderId:options.folderId||'', typeList:options.typeList||''
        },
        success: (uploadFileRes) => {
            const data = JSON.parse(uploadFileRes.data)
            if(data.errNo!==0){
                switch (data.errNo){
                    case 501:
                        uni.navigateTo({url:'/pages/login/login'})
                        break
                    default:
                        reject(data)
                        break
                }
            }else{
                resolve(data)
            }
        },
        fail: (err) => {
            console.log(err)
            reject(err)
        }
    });

    uploadTask.onProgressUpdate((res) => {
        eventBus.emit('onUploadProgress', { res })
    });
})
