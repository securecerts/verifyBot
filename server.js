const express = require("express");

const server = express()
const port = process.env.PORT || 3000

server.all("/", (req,res) =>{
    res.send("Bot is running!")
})

function keepAlive(){
    server.listen(port,()=>{
        console.log(`The server is up on port ${port}`);
    })
}

module.exports = keepAlive