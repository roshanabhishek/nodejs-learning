const fs = require('node:fs/promises');

// For 1 Billion
// Exection time: 2:22.697secs
// CPU Usage: 100%
// Memory Usage: ~60MB
// File size: 10.9GB
(async() => {
    console.time('readyBig');
    const fileHandleRead = await fs.open('read-big.txt', 'r');
    const fileHandleWrite = await fs.open('dest.txt', 'w');
    let split = '';

    // default highWaterMark => 64 * 1024
    const highWaterMarkValue = 64 * 1024;
    const readStream = fileHandleRead.createReadStream({ highWaterMark: highWaterMarkValue });
    const writeStream = fileHandleWrite.createWriteStream();

    readStream.on('data', (chunk) => {
        const numbers = chunk.toString('utf-8').split("  ");
        console.log(chunk);

        // combine truncated number in 2 chunks
        if(Number(numbers[0]) + 1 !== Number(numbers[1])) {
            if(split) {
                numbers[0] = split.trim() + numbers[0].trim();
           }
       }
    
        // last number might be truncated to consecutive chunks
        if(Number(numbers[numbers.length - 2]) + 1 !== Number(numbers[numbers.length - 1])) {
            split = numbers.pop();
        }

        console.log(numbers);
        // can do process before write
        // divisible by 10
        numbers.forEach((each) => {
            let num = Number(each);
            if (num % 10 === 0) {
                if (!writeStream.write(" " + num + " ")) {
                    readStream.pause();
                }
            }
        });

    });

    writeStream.on('drain', () => {
        readStream.resume();
    });

    readStream.on('end', () => {
        console.timeEnd('readyBig');
    })
})();