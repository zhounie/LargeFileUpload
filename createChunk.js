import SparkMD5 from './spark-md5.js'

export function createChunk (file, index, chunkSize) {
    return new Promise((resolve, reject) => {
        let start = index * chunkSize
        let end = (index + 1) * chunkSize
        if (end > file.size) {
            end = file.size
        }
        const spark = new SparkMD5.ArrayBuffer()
        const fileRender = new FileReader()
        const blob = file.slice(start, end)
        fileRender.onload = (e) => {
            spark.append(e.target.result)
            resolve({
                start,
                end,
                index,
                hash: spark.end(),
                blob
            })
        }
        fileRender.readAsArrayBuffer(blob)
    })
}