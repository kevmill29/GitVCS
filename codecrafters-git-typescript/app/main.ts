import * as fs from 'fs';
import zlib from "zlib";
import crypto from 'crypto'

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
    Init = "init",
    Catfile = 'cat-file',
    HashObject = 'hash-object'
}

// Flags and Filepaths are stored here
const getFlags = ()=>args[1].slice(1).split("");
const getFilePath = ()=>args[2];

switch (command) {
    case Commands.Init:
        // You can use print statements as follows for debugging, they'll be visible when running tests.
        console.error("Logs from your program will appear here!");

        //Uncomment this block to pass the first stage
        fs.mkdirSync(".git", { recursive: true });
        fs.mkdirSync(".git/objects", { recursive: true });
        fs.mkdirSync(".git/refs", { recursive: true });
        fs.writeFileSync(".git/HEAD", "ref: refs/heads/main\n");
        console.log("Initialized git directory");
        break;
    case Commands.Catfile:
        const flag = args[1];
        if(flag === "-p"){
            if(getFlags().includes("p")){
                const blobDir = args[2].substring(0,2);
        const blobFile = args[2].substring(2);
        const blob = fs.readFileSync(`.git/objects/${blobDir}/${blobFile}`);
        const decompressedBuffer = zlib.unzipSync(blob);
        const nullByteIndex = decompressedBuffer.indexOf(0);
        const blobContent = decompressedBuffer.subarray(nullByteIndex+1).toString();
        process.stdout.write(blobContent);
            }
        }
        
        break;
    case Commands.HashObject:
        const data = fs.readFileSync(getFilePath());
        const metaData = Buffer.from(`blob${data.length}\0`);
        const contents = Buffer.concat([metaData, data]);
        console.log(data.toString('utf8'))
        const hash = crypto.createHash('sha1').update(contents).digest("hex");
        process.stdout.write(hash);

        if(getFlags().includes("w")){
            const compressedData = zlib.deflateSync(contents);
            const objectPath = `.git/objects/${hash.slice(0,2)}/${hash.slice(2)}`;
            fs.mkdirSync(`.git/objects/${hash.slice(0,2)}`, {recursive: true})
            fs.writeFileSync(objectPath, compressedData);
        }
    default:
        throw new Error(`Unknown command ${command}`);
}
