import { createChunk } from './createChunk.js'

onmessage = async (e) => {
    const {
        file,
        CHUNK_SIZE,
        start,
        end
    } = e.data
    const proms = []
    for (let i = start; i < end; i++) {
        proms.push(createChunk(file, i, CHUNK_SIZE))
    }
    const chunks = await Promise.all(proms)
    postMessage(chunks)
}