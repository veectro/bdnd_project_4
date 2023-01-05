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
let gas = "2000000"
let ORACLES_COUNT = 20

let accounts; // accounts holder
let requestCounter = 0;

let oracles = {};

// mocked fixed status flight response
let flightStatusCode = [10, 20, 30, 20, 40, 20, 20, 10]

const init = async () => {
    let FEE = await flightSuretyApp.methods.REGISTRATION_FEE().call();
    console.log(`Starting oracle with FEE is ${FEE}`);

    accounts = await web3.eth.getAccounts();
    for (let i = 0; i < ORACLES_COUNT; i++) {
        try {
            console.log(`Registering oracle ${i} with account ${accounts[i]}`);
            await flightSuretyApp.methods.registerOracle().send({from: accounts[i], value: FEE, gas: gas});

            let result = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[i]});
            oracles[accounts[i]] = result;
            console.log(`Oracle Registered for ${accounts[i]} : ${result}`);

        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }
}

init()

const submitOracleResponse = async (account_id, index, airline, flight, timestamp, statusCode) => {
    try {

        console.log(`Submitting event with ${account_id} - ${index} - ${airline} - ${flight} - ${statusCode}`);
        await flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode).send({
            from: account_id,
            gas: gas
        })
    } catch (error) {
        console.log(`Error while sending oracle ${account_id} answer : `, error.message)
    }
}

// event listener for OracleRequest event in the blockchain
flightSuretyApp.events.OracleRequest({fromBlock: 0}, function (error, event) {
        if (error) console.log(error.message)
        let {index, airline, flight, timestamp} = event.returnValues
        console.log(`Receiving event with ${index} ${airline} - ${flight}`);

        for (var acc_idx in oracles) {
            var indexes = oracles[acc_idx];
            if (indexes.includes(index)) {
                submitOracleResponse(acc_idx, index, airline, flight, timestamp, flightStatusCode[requestCounter]);
            }
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
