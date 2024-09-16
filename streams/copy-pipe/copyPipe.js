const fs = require("node:fs/promises");
const { pipeline } = require('node:stream');

// For 10 million
// Exection time: ~520ms
// Memory used - 12MB
// File size - ~89MB

// (async () => {
//     console.time("copy");
//     const destFile = await fs.open('copy.txt', 'w');
//     const readFile = await fs.readFile('read-small.txt');

//     await destFile.write(readFile);

//     console.timeEnd("copy");
// })()


// For 100 Million
// Exection time: ~1.2s
// Memory used - ~28MB
// File size - 1GB
// (async () => {
//     console.time("copy");
//     const srcFile = await fs.open('read-big.txt', 'r');
//     const destFile = await fs.open('copy.txt', 'w');

//     let bytesRead = -1;

//     while(bytesRead !== 0) {
//         const readResult = await srcFile.read();
//         bytesRead = readResult.bytesRead;

//         if(bytesRead !== 16384) {
//             const indexNotFilled = readResult.buffer.indexOf(0);
//             const newBuffer = Buffer.alloc(indexNotFilled);
//             readResult.buffer.copy(newBuffer, 0, 0, indexNotFilled);
//             destFile.write(newBuffer)
//         } else {
//             destFile.write(readResult.buffer)
//         }
//     }
//     console.timeEnd("copy");
// })()

// For 1 Billion
// Exection time: ~10s
// Memory used - ~25MB
// CPU Usage: 75%
// File size - 10.9GB
(async () => {
    console.time("copy");
    const srcFile = await fs.open('read-gigantic.txt', 'r');
    const destFile = await fs.open('copy.txt', 'w');

    const readStream = srcFile.createReadStream();
    const writeStream = destFile.createWriteStream();

    // readStream.pipe(writeStream);
    // readStream.unpipe(writeStream);
    // readStream.readableFlowing => boolean

    // readStream.on('end', () => {
    //     console.timeEnd("copy");
    // })

    // s1, s2, s3 (all middle stream) must be duplex or transform
    // eg: (s1 will writableStream on writing from readStream, but as readableStream on writing to s2)
    // pipeline(readStream, s1, s2, s3, writeStream)
    pipeline(readStream, writeStream, (err) => {
        console.log(err);
        console.timeEnd("copy");
    })
})()