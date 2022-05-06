// Discord.js algosdk and .env packages installed via NPM
const { Client, Intents, GuildMember, Guild } = require('discord.js');
const algosdk = require('algosdk');
const keepAlive = require("./server")
require('dotenv').config()

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

// When bot is online
client.on("ready", () => {
  console.log(`${client.user.tag}`);
})

//Algo params
const port = "";
const token = {
    "x-api-key": process.env.API // fill in yours
};

//Indexer connection
const BASE_SERVER = "https://mainnet-algorand.api.purestake.io/idx2";
let algoIndexer = new algosdk.Indexer(token, BASE_SERVER, port);

//Storing created assets and assets present in the holder's address
let assetidList = [];
let holderAssets = [];
let optinCheck = false;
let holderNfts = [];

let optinAsset = '726327745'

// Parameters to connect to Algorand blockchain via indexer

async function getInfo(collectorAccount) {
    let optinCheck = false;
     //The creator accout/accounts
     let account = [ `PTPBICPBDFFJRHWFEQKV33NDRKMWOY7FA24CJIQFWBNP6V4E2TDQVDF37Q`, `AD5J43O3N6UPEUFYOZHT6WBUXDOK66MMGL3JHQV77Y2EAEZJVLRCINWYBI`, `72BIB7C53AU3EFUJ5SFNGANWHVMZCGH2RDDBLXYS3Q3KH6NIB5MCLMWNTI`];

    //Getting list of asset ids from creator account
    const creatorAssetids = async function(algoIndexer, account) {
        for (let i = 0; i < account.length; i++) {
            let accountInfo = await algoIndexer.lookupAccountCreatedAssets(account[i]).do();
            for (let idx = 0; idx < accountInfo['assets'].length; idx++) {
                let scrutinizedAsset = accountInfo['assets'][idx];
                let assetId = scrutinizedAsset['index'];
                assetidList.push(assetId)
            }
        }  
    } 

    //checking the assets available with the collector
    const collectorAssetids = async function(algoIndexer, collectorAccount) {
        
        let accountInfo = await algoIndexer.lookupAccountAssets(collectorAccount).do();
        for (let idx = 0; idx < accountInfo['assets'].length; idx++) {
            let scrutinizedAsset = accountInfo['assets'][idx];
            if(scrutinizedAsset['asset-id'] == optinAsset){
                optinCheck = true;
            }
            if(scrutinizedAsset['amount'] > 0){
                let assetId = scrutinizedAsset['asset-id'];
                holderAssets.push(assetId)
            }
            
        }
    }

    //comparing the assets to findout if he is a holder
    async function holdercheck (){
        for(let i=0; i< holderAssets.length; i++){
            for(let j=0; j< assetidList.length; j++){
                if(holderAssets[i] == assetidList[j]){
                    holderNfts.push(holderAssets[i]) ;
                }
            }
        }   
    }

    async function optIn() {
        if(optinCheck == true){
            return true
        }
     
        return false;
    } 
     
    //Function calls to run the process
    await creatorAssetids(algoIndexer, account)
    await collectorAssetids(algoIndexer, collectorAccount)
    await holdercheck()
    return await optIn()
}





//Looking for messages from the discord and respond
client.on('messageCreate', async (message) => {

    if (message.content.startsWith(`!holder`)){
        let address = message.content.substring(8)
        let verification = await(getInfo(address))
        
        if(verification == true && holderNfts.length > 0){
            message.member.roles.add('938661361884475392');
            message.channel.send('Verification complete.\n Added role Ice World Citizen');
        }else if(verification == false && optinCheck == false){
            message.reply('Please opt-in using `https://www.randgallery.com/algo-collection/?address=726327745` \n Wait for 10 seconds and try `!holder` command.');
        }else{
            message.reply('We could not detect the NFT in your wallet. Please contact admin.')
        }
            
    }  
})

keepAlive()  
client.login(process.env.DISCORD);
