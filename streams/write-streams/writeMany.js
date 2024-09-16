// const fs = require("node:fs/promises");

// Exection time: 9.5s
// CPU Usage: 101%
// Memory Usage: 50MB
// (async () => {
//     console.time("writeMany")
//     const fileHandle = await fs.open('write.txt', "w");

//     for(let i=0;i< 1000000;i++){
//         await fileHandle.write(` ${i} `);
//     }
//     console.timeEnd("writeMany")
// })();

// const fs = require("node:fs");

// Exection time: 1.6s
// CPU Usage: 100%
// Memory Usage: 50MB
// (async () => {
//     console.time("writeMany")
//     fs.open('write.txt', "w", (err, fd) => {
//         for(let i=0;i< 1000000;i++){
//             fs.writeSync(fd, ` ${i} `);
//         }
//         console.timeEnd("writeMany")
//     });
// })();

const fs = require("node:fs/promises");

// Exection time: 250ms
// CPU Usage: 100%
// Memory Usage: ~150MB
// (async () => {
//     console.time("writeMany")
//     const fileHandle = await fs.open('write.txt', "w");
//     const stream = fileHandle.createWriteStream();

//     for(let i=0;i< 10000000;i++){
//         const buf = Buffer.from(` ${i} `, 'utf8');
//         stream.write(buf);
//     }
//     console.timeEnd("writeMany")
// })();

// INTERNAL BUFFER DEFAULT 16384 Bytes ~16KB
// on internal_buffer===16384 it write data and empties internal buffer

// For 10 million
// Exection time: ~3secs
// CPU Usage: 100%
// Memory Usage: ~150MB

// For 1 million
// Exection time: ~350ms
// CPU Usage: 100%
// Memory Usage: ~130MB

(async () => {
    console.time("writeMany")
    const fileHandle = await fs.open('write.txt', "w");
    const stream = fileHandle.createWriteStream();

    // 1Billion - 4:47.070
    const counter = 1000000;
    let i = 0;
    const writeManyFn = () => {
        while(i<counter) {
          const buf = Buffer.from(` ${i} `, 'utf8');

          if(i === counter - 1) {
            return stream.end(buf);
          }

         // return true if internal buffer < highWaterMark
          if(!stream.write(buf)) break;

          i++;
        }
    }

    writeManyFn();

    // listens everytime on internal buffer is emptied
    stream.on('drain', () => {
        writeManyFn();
    });
    
    stream.on('finish', () => {
        console.timeEnd("writeMany")
        fileHandle.close();
    });
})();