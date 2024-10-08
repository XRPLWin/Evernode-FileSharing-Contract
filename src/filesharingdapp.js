const fs = require('fs');
const crypto = require('crypto')

const htmlFile = 'template/app.html';
const uploadDir = 'uploadedfiles';

export class filesharingdapp {
    sendOutput;     // This function must be wired up by the caller.
    sendRawOutput;  // This function must be wired up by the caller.

    async handleRequest(user, message, isReadOnly) {

        // Serve HTML of this DApp
        if(message.type == 'gethtml') {
            await this.sendOutput(user,{
                type: 'html',
                data: (fs.readFileSync(htmlFile)).toString()
            });
        } else if (message.type == 'download-metadata') {
            if(message.uploaderpubkey && message.fileid) {
                const userID = message.uploaderpubkey;
                const metafile = uploadDir+'/'+userID+'/'+parseInt(message.fileid)+'/metadata.json';
                let metadataContents = (fs.readFileSync(metafile)).toString();
                //parse metadataContents and remove all properties starting with "_" - those are protected and should not be exposed
                //todo
                await this.sendOutput(user,{
                    type: "json",
                    data: metadataContents
                });
            }
        } else if (message.type == 'download') {
            if(message.uploaderpubkey && message.fileid && message.part) {
                const userID = message.uploaderpubkey;
                //Get Metafile to check if this file is password protected
                const metafile = uploadDir+'/'+userID+'/'+parseInt(message.fileid)+'/metadata.json';
                let metadataContents = JSON.parse((fs.readFileSync(metafile)).toString());

                let allowDownload = true;
                if(metadataContents.access == 'password') {
                    // Password is required
                    allowDownload = false;
                    if(message.password) {
                        // Password was sent
                        let sentPasswordHash = crypto.createHash('md5').update(message.password).digest("hex");
                        if(sentPasswordHash == metadataContents._access_password) { //compare
                            allowDownload = true;
                        }
                    }
                }

                if(allowDownload) {
                    const chunkfile = uploadDir+'/'+userID+'/'+parseInt(message.fileid)+'/'+parseInt(message.part)+'.chunk';
                    let chunkContents = (fs.readFileSync(chunkfile));
                    await this.sendOutput(user,{
                        type:"filepart",
                        data: chunkContents
                    });
                } else {
                    await this.sendOutput(user, {
                        type: 'error',
                        error: 'Forbidden - password is invalid'
                    })
                }
            }
        } else if (message.type == 'upload-metadata') {
            if (isReadOnly) {
                await this.sendOutput(user, {
                    type: 'error',
                    error: 'Not supported in readonly mode'
                })
            } else if(message.fileid && message.contents) {
                const userID = user.publicKey;
                const dir = uploadDir+'/'+userID+'/'+parseInt(message.fileid);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                if (!fs.existsSync(dir+'/metadata.json')) {
                    fs.writeFileSync(dir+'/metadata.json',message.contents);
                }
                await this.sendOutput(user, {
                    type: 'success',
                    error: 'Metadata file stored'
                })
            }
        } else if (message.type == 'upload') {
           
            if (isReadOnly) {
                await this.sendOutput(user, {
                    type: 'error',
                    error: 'Not supported in readonly mode'
                })
            } else if(message.fileid && message.totalchunks && message.chunkno && message.chunk) {
                //Store file chunk
                const userID = user.publicKey;
                const dir = uploadDir+'/'+userID+'/'+parseInt(message.fileid);

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                //store file chunk
                let chunkFilepath = dir+'/'+message.chunkno+'.chunk';

                if (!fs.existsSync(chunkFilepath)) {
                    fs.writeFileSync(chunkFilepath,Buffer.from(message.chunk, "hex"));
                }
                await this.sendRawOutput(user, {
                    type: 'success',
                    error: 'Chunk '+message.chunkno+' stored'
                })
            }
        }
        else {
            await this.sendOutput(user, {
                type: 'error',
                error: 'Unknown message type'
            })
        }
    }
}