const { Transform } = require("node:stream");
const fs = require("fs/promises");

class LogAnalysisStream extends Transform {
    _transform(chunk, encoding, callback){
        // Write transformation function here

        // either
        //    this.push(chunk);
        //    callback(null);
        //    or
        callback(null, chunk);
    }
}


(async () => {
    const readFileHandle = await fs.open('log-analysis.txt', 'r');
    const writeFileHandle = await fs.open('computed-analysis.txt', 'w');

    const readableStream = readFileHandle.createReadStream();
    const writeStream = writeFileHandle.createWriteStream();

    const logAnalysisStream = new LogAnalysisStream();

    readableStream.pipe(logAnalysisStream).pipe(writeStream);
})();
