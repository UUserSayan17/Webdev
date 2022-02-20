const PORT = 3000
const express = require('express')
const axios = require('axios')
const { response } = require('express')
const { MongoClient, AutoEncryptionLoggerLevel } = require('mongodb'); // declaring mongo client
const bodyparser = require('body-parser')
const cheerio = require('cheerio')
const config = require('./config.json')
const { ObjectID } = require('bson');
const { randomInt } = require('crypto');
const Encryption = require('node_triple_des');

const client = new MongoClient(config.url); //setting up the client with the uri


const app = express()
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())


app.get('/', (req, res) => {
    res.json(`Test app API`);
})

async function connectDb() {
    try {
        await client.connect();
    } catch (e) {
        console.error(e)
    } finally {
    }
    console.log("Connected")
}
connectDb().catch(console.error);

////////////////////////////ROUTES////////////////////////////
app.get('/admin', async (req, res) => {
    await getAdmin(req, res, client);
})

app.post('/admin/user', async (req, res) => {
    await assignUserSlotAsAdmin(req, res, client);
})

app.post('/user/verify', async (req, res) => {
    await verifyCode(req, res, client);    
})

app.post('/user/otp', async (req, res) => {
    return await checkOTP(req, res, client);
})

app.post('/user/', async (req, res) => {
    return await createUser(req, res, client);
})

app.get('/user/', async (req, res) => {
    return await getUser(req, res, client);
})

app.listen(PORT, () => console.log(`server running on port ${PORT}`))

////////////////////////////FUNCTIONS////////////////////////////


async function getAdmin(req, res, client) {
    let body = req["body"];
    let userId = req["headers"]["x-user-id"];

    const cursor = await client.db("demoDB").collection("listing").findOne({ "_id": ObjectID(userId) });
    console.log(`${JSON.stringify(cursor)}`);
    return cursor;
}

async function assignUserSlotAsAdmin(req, res, client) {
    let body = req["body"];
    let userId = req["headers"]["x-user-id"];
    var code = await generateCode(5); //check if it's in the db once

    var newUser = { verification_code: code };
    client.db("demoDB").collection("users").insertOne(newUser, function (err, result) {
        if (err) throw err;
        console.log(`--New User inserted, code ${newUser}`);
        return
    });

    return res.json(newUser);
}

async function verifyCode(req, res, client) {
    console.log('insdie verifyCode');        
    let code = req["body"]["verification_code"]    

    await client.db("demoDB").collection("users").findOne({ verification_code: code }, async function (err, result) {
        if (err) throw err;
        if (result != null) {
            console.log(`--Code Verified-- id${result._id}`)
            return await sendOTP(result, req, res, client);                
        }
    });    
}

async function createUser(req, res, client) {
    let body = req["body"];
    let userId = req["headers"]["x-user-id"];
    data = await encrypt(body);

    client.db("demoDB").collection("users").updateOne(
        { "_id": ObjectID(userId) },
        { $set: { data: data } },
        async function (err, result) {
            if (err) throw err;
            console.log(`RESULT ${JSON.stringify(result)}`)
            if(result!=null && result["modifiedCount"]!=0){
                return res.status(200).json("User Created");            
            }
            else{
                return res.status(500).json("Error in DB");
            }
        });    
}

async function encrypt(data) {//we will encrypt the data here     
    const encrypt =  Encryption.encrypt('SLOKE', JSON.stringify(data));
    console.log(encrypt);
    return encrypt;
}

async function decrypt(data) {//we will encrypt the data here         
    const decrypt =  Encryption.decrypt('SLOKE', data);
    console.log(decrypt);    
    return decrypt;
}

async function getUser(req, res, client) {    
    let userId = req["headers"]["x-user-id"];
    console.log(`USER ID ${userId}`);

    const cursor = await client.db("demoDB").collection("users").findOne({_id:ObjectID(userId) }, async function (err, result) {
        if (err) throw err;
        console.log(`RESULT ${JSON.stringify(result)}`);
        if (result != null) {  
            console.log(`RESULT ${result}`);
            let data = await decrypt(result["data"])
            return res.json(JSON.parse(data));
        }
        else{
            console.log(`SOMETHING WENT WRONG`);
            return res.json(`SOMETHING WENT WRONG`);
        }
    });        
}


async function sendOTP(user, req, res, client) {
    num1 = randomInt(10, 100);
    num2 = randomInt(9, 99);
    var phoneNumber = parseInt(req["body"]["phone_number"])
    var OTP = `Solve : ${num1} + ${num2}`;
    console.log(`OTP : ${OTP}`)
    num=num1+num2;

    client.db("demoDB").collection("users").updateOne(
        { "_id": ObjectID(user["_id"])},
        { $set: { OTP : num, phone_number: phoneNumber } },
        function (err, result) {
            if (err) throw err;            
            console.log(result);            
            return res.json(OTP);           
        });    
}


async function checkOTP(req, res, client) {
    let body = req["body"];    
    let phoneNumber = parseInt(req["body"]["phone_number"]);
    let OTP = req["body"]["OTP"];

    const cursor = await client.db("demoDB").collection("users").findOne({ phone_number: phoneNumber }, function (err, result) {
        if (err) throw err;
        console.log(`Result ${JSON.stringify(result)}`);
        if (result.OTP.toString() == OTP.toString()) {
            return res.status(200).json({ "verified": true, "user_id": result._id });
        }
        return res.status(500).json({ "verified": false });
    });    
}

async function generateCode(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    console.log(`--Generated OTP-- ${result}`)
    return result;
}