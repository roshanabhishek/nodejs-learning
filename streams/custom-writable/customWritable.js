const { Writable } = require("node:stream");
const fs = require("fs/promises");

class CustomWritable extends Writable {
    constructor({ highWaterMark, fileName }){
        super({ highWaterMark });
        this.fileName = fileName;
        this.chunk = [];
        this.chunkSize = 0;
    }

    // runs after constructor and before _write
    // eg: opening file
    _construct(callback) {
        fs.open(this.fileName, 'w', (err, fd) => {
            if(err){
                // args mean we have error and not proceed
                callback(err)
            } else {
                // file descriptor just a number
                this.fd = fd;

                // no arg means it was successfull
                callback();
            }
        })

    }
    // Never emit event from child classes
    // let class do it
    _write(chunk, encoding, callback){
        this.chunk.push(chunk);
        this.chunkSize += chunk.length;

        if(this.chunkSize >= this.writableHighWaterMark) {
            fs.write(this.fd, Buffer.concat(this.chunk), (err) => {
                if(err) {
                    return callback(err)
                } else {
                    this.chunk = [];
                    this.chunkSize = 0;
                    callback();
                }
            })
        } else {
            callback();
        }
    }

    _final(callback) {
        fs.write(this.fd, Buffer.concat(this.chunk), (err) => {
            if(err) {
                return callback(err)
            }
            this.chunk = [];
            callback();
        })
    }

    _destroy(error, callback) {
        if(this.fd) {
            fs.close(this.fd, (err) => {
                callback(err | error);
            })
        } else {
            callback(error);
        }
    }
}

(async () => {
    console.time("writeMany");
  
    const stream = new CustomWritable({
      fileName: "text.txt",
    });
  
    let i = 0;
  
    const numberOfWrites = 1000000;
  
    const writeMany = () => {
      while (i < numberOfWrites) {
        const buff = Buffer.from(` ${i} `, "utf-8");
  
        // this is our last write
        if (i === numberOfWrites - 1) {
          return stream.end(buff);
        }
  
        // if stream.write returns false, stop the loop
        if (!stream.write(buff)) break;
  
        i++;
      }
    };
  
    writeMany();
  
    let d = 0;
    // resume our loop once our stream's internal buffer is emptied
    stream.on("drain", () => {
      ++d;
      writeMany();
    });
  
    stream.on("finish", () => {
      console.log("Number of drains:", d);
      console.timeEnd("writeMany");
    });
  })();