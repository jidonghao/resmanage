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