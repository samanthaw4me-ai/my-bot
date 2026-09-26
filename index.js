const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")
const express = require("express")
const app = express()
app.get("/", (req,res)=> res.send("Bot 24/7 Online"))
app.listen(3000)
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const sock = makeWASocket({ auth: state, logger: P({level:"silent"}), browser: ["Chrome","Windows","10"] })
  sock.ev.on("creds.update", saveCreds)
  if(!sock.authState.creds.registered){
    setTimeout(async()=>{
      let code = await sock.requestPairingCode("94723073689")
      console.log("YOUR CODE: " + code)
    },5000)
  }
  sock.ev.on("connection.update", s=>{
    if(s.connection==="open") console.log("CONNECTED")
    if(s.connection==="close" && s.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) start()
  })
  sock.ev.on("messages.upsert", async(m)=>{
    const msg=m.messages[0]; if(!msg.message) return
    const from=msg.key.remoteJid
    const body=msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    if(body==".alive") await sock.sendMessage(from,{text:"✅ පැය 24ම Online!"},{quoted:msg})
  })
}
start()
