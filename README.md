# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

Main Features: 
- Flight delay insurance for passenger (Business App)
- Managed as a collaboration between multiple airlines (Multi Party)
- Passangers purchase insurance prior to flight (Payable)
- In case of delay due to airline fault => passenger are paid  1.5X amount of the payment of insurance (Payout)
- Oracle provide flight status information (Oracle)

Storage:  
- Airlines
- Passengers
- Payout

![architecture.png](statics%2Farchitecture.png)

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`

![flight_surety_test_result.png](images%2Fflight_surety_test_result.png)

`truffle test ./test/oracles.js`

![oracle_test_result.png](images%2Foracle_test_result.png)

To use the dapp:

`export NODE_OPTIONS=--openssl-legacy-provider`  
`truffle migrate`  
`npm run dapp`  

To view dapp:

`http://localhost:8000`

## Develop Server

```
export NODE_OPTIONS=--openssl-legacy-provider
npm run server
truffle test ./test/oracles.js
```

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder

## FAQ

[Flight Surety Project FAQ — Udacity Blockchain](https://andresaaap.medium.com/flightsurety-project-faq-udacity-blockchain-b4bd4fb03320)

## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)