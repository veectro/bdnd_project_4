import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')
    .replace('localhost', '127.0.0.1')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

// Constants
const FEE = web3.utils.toWei("1", "ether")
const ORACLES_COUNT = 20

let accounts; // accounts holder
let requestCounter = 0;

// mocked fixed status flight response
let flightStatusCode = [10, 20, 30, 20, 40, 20, 20, 10]

const init = async () => {
    accounts = await web3.eth.getAccounts();
    for (let i = 0; i < ORACLES_COUNT; i++) {
        try {
            let result = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[i]});
            console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }
}

init()

const submitOracleResponse = async (oracle, index, airline, flight, timestamp, statusCode) => {
    try {
        await flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode).send({
            from: accounts[oracle],
            gas: "6000000"
        })
    } catch (error) {
        console.log(`Error while sending oracle -${oracle}- answer : `, error.message)
    }
}

// event listener for OracleRequest event in the blockchain
flightSuretyApp.events.OracleRequest({fromBlock: 0}, function (error, event) {
        if (error) console.log(error.message)
        let {index, airline, flight, timestamp} = event.returnValues

        for (let i = 0; i < ORACLES_COUNT; i++) {
            submitOracleResponse(i, index, airline, flight, timestamp, flightStatusCode[requestCounter]);
        }
        requestCounter++;
    }
);

const app = express();
app.get('/api', (req, res) => {
    res.send({
        message: 'An API for use with your Dapp!'
    })
})

export default app;
