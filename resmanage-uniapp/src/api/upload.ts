import baseUrl from "../../baseUrl";

export const uploadFile = (files: UniApp.UploadFileOptionFiles[]) => new Promise((resolve, reject) => {
    const uploadTask = uni.uploadFile({
        url: baseUrl + "api/upload/upload",
        files,
        name: 'files',
        header: {
            'authorization': uni.getStorageSync('authorization') || ''
        },
        formData: {
            'user': 'test',
        },
        success: (uploadFileRes) => {
            resolve(JSON.parse(uploadFileRes.data))
        },
        fail: (err) => {
            console.log(err)
            reject(err)
        }
    });

    uploadTask.onProgressUpdate((res) => {
        console.log('上传进度' + res.progress);
        console.log('已经上传的数据长度' + res.totalBytesSent);
        console.log('预期需要上传的数据总长度' + res.totalBytesExpectedToSend);
    });
})
