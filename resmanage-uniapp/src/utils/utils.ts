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

/**
 * 用于h5中下载文件
 * @param url
 * @param filename
 * @param focus
 */
export function downloadFile(url:string, filename:string,focus = false) {
    // 图片文件扩展名列表
    let imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

    // 检查URL是否指向图片
    let isImage = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));

    // 如果是图片，使用downloadImage方法
    if (isImage&&!focus) {
        downloadImage(url, filename);
    } else {
        let element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', filename);

        // 设置样式为不可见
        element.style.display = 'none';
        document.body.appendChild(element);

        // 触发点击事件
        element.click();

        // 删除元素
        document.body.removeChild(element);
    }
}

function downloadImage(url:string, filename:string) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            let blobUrl = URL.createObjectURL(blob);

            let element = document.createElement('a');
            element.setAttribute('href', blobUrl);
            element.setAttribute('download', filename);

            // 设置样式为不可见
            element.style.display = 'none';
            document.body.appendChild(element);

            // 触发点击事件
            element.click();

            // 删除元素
            document.body.removeChild(element);

            // 释放blob URL
            URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
           showModal({content:'受到跨域资源共享限制，请在新窗口中自行保存'}).then(()=>{
                downloadFile(url,filename,true)
            })
        });
}
