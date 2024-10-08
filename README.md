# Evernode File Sharing Contract
It allows you to upload and share link to download large file. 

This contract consist of two components, client loader (HTML/JS static) and contract code.

# Run client

Find /client/index.html and serve it locally in secure context or host it on your domain, yes just that file (low bandwith). This is only file required to load your smart contract to the web browser.

In `index.html` there is `const ws_endpoint = 'wss://localhost:8081';` which you can change to point to your instance in production.

# Run contract locally

```
npm start
```
(requires Docker - see Evernode official documentation)

# What does it do?

It allows you to upload and share link to download large file.  
File is chunked in web browser and chunks are uploaded to the contract. Same goes to download, it downloads chunks and web browser rearranges chunks to whole file.

Additional implemented options is to track metadata of uploaded file where you can add additional context, in this contract we are using password protection and adding note with uploaded file.

# The tech and showcase

This contract in whole is showcasing few things:  
1. Keeping website logic (layout, javascript, ...) INSIDE contract
2. Using static loader file (index.html) to load contract - it can be reused for many types of contract which follow same convention
3. Chunking and rearranging files in web browser (working with buffers...)
4. Saving and serving files from Evernode Contract
5. Serving various request from Evernode Contract

## Author
XRPLWin (xrplwin.com)
