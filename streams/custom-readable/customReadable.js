const { Readable } = require("node:stream");
const fs = require("fs/promises");

class CustomWritable extends Readable {
    constructor({ highWaterMark, fileName }){
        super({ highWaterMark });
        this.fileName = fileName;
        this.fd = null;
    }

     // runs after constructor and before _write
    // eg: opening file
    _construct(callback) {
        fs.open(this.fileName, 'w', (err, fd) => {
            // args mean we have error and not proceed
            if(err) return callback(err)
            // file descriptor just a number
            this.fd = fd;

            // no arg means it was successfull
            callback();
        })
    }

    _read(size){
        const buff = Buffer.alloc(size);
        fs.read(this.fd, buff, 0, size, (err, bytesRead) => {
            if(err) return this.destroy(err);
            // null indicates it's done
            this.push(bytesRead > 0 ? buff.subarray(0, bytesRead) : null)
        })

    }

    _destroy(error, callback) {
        if (this.fd) {
          fs.close(this.fd, (err) => callback(err || error));
        } else {
          callback(error);
        }
    }
}

const stream = new CustomWritable({ fileName: "text.txt" });

stream.on("data", (chunk) => {
  console.log(chunk.length);
  console.log(chunk.toString("utf-8"));
});

stream.on("end", () => {
  console.log("Stream is done reading.");
});