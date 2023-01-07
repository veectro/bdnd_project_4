import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

const fundAmount = Web3.utils.toWei("10", "ether");

export default class Contract {
    constructor(network, callback) {
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];

            let counter = 1;

            while (this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            this.fundAirline(this.airlines[3]);

            while (this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    fundAirline(airlineAddress) {
        let self = this;

        console.log(`Funding airline with address ${airlineAddress} with amount ${fundAmount}`);
        self.flightSuretyApp.methods
            .fund()
            .send({from: airlineAddress, value: fundAmount}, (error, result) => {
                console.log(error, result);
            });
        console.log(`Successful : Funding airline with address ${airlineAddress} with amount ${fundAmount}`);
    }

    isOperational(callback) {
        let self = this;
        self.flightSuretyApp.methods
            .isOperational()
            .call({from: self.owner}, callback);
    }

    buyInsurance(amount, flight, callback) {
        let self = this;

        let passengerAddress = self.passengers[3];

        console.log(`Buy insurance with address ${passengerAddress} with amount ${amount}`);
        try {
            let payload = {
                airline: self.airlines[3],
                flight,
                amount: self.web3.utils.toWei(amount, "ether").toString(),
                timestamp: Math.floor(Date.now() / 1000),
            };

            self.flightSuretyApp.methods
                .buyInsurance(payload.airline)
                .send(
                    {from: passengerAddress, value: payload.amount},
                    (error, result) => {
                        callback(error, result);
                    }
                );
        } catch (error) {
            console.log(error);
        }
        console.log(`Successful : Buy insurance with address ${passengerAddress} with amount ${amount}`);
    }

    withdraw(callback) {
        let self = this;
        let passengerAddress = self.passengers[3];
        try {
            self.flightSuretyApp.methods
                .withdraw()
                .send({from: passengerAddress}, (error, result) => {
                    callback(error, result);
                });
            console.log(`Successful : Withdraw insurance with address ${passengerAddress}`);
        } catch (error) {
            console.log(error);
        }
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[3],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000),
        };

        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({from: self.owner}, (error, result) => {
                console.log(error, payload);
                callback(error, payload);
            });
    }
}