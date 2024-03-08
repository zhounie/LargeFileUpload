
const CHUNK_SIZE = 2 * 1024 * 1024

const THREAD_COUNT = navigator.hardwareConcurrency || 4


export const cutFile = (file) => {
    return new Promise((resolve) => {
        const chunkCount = Math.ceil(file.size / CHUNK_SIZE)
        const threadChunkCount = Math.ceil(chunkCount / THREAD_COUNT)
        const result = []
        let finishCount = 0
        for (let i = 0; i < THREAD_COUNT; i++) {
            const worker = new Worker('./worker.js', {
                type: 'module'
            })

            const start = i * threadChunkCount
            let end = (i + 1) * threadChunkCount
            if (end > chunkCount) {
                end = chunkCount
            }
    
            worker.postMessage({
                file,
                CHUNK_SIZE,
                start,
                end
            })
    
            worker.onmessage = async (e) => {
                for (let i = start; i < end; i++) {
                    result[i] = e.data[i - start]
                }
                worker.terminate()
                finishCount++
                if (finishCount === THREAD_COUNT) {
                    resolve(result)
                }
            }
        }
    })
}