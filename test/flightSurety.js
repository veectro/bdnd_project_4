var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function () {

        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, {from: config.testAddresses[2]});
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false);
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

        await config.flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try {
            await config.flightSurety.setTestingMode(true);
        } catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);

    });

    it('(multiparty) only existing airline may register a new airline until there are at least four airlines registered', async () => {
        // ARRANGE
        let airline_one = accounts[1];
        await config.flightSuretyApp.registerAirline(airline_one, {from: config.owner});

        let airline_two = accounts[2];
        await config.flightSuretyApp.registerAirline(airline_two, {from: config.owner});

        let airline_three = accounts[3];
        await config.flightSuretyApp.registerAirline(airline_three, {from: config.owner});

        let airline_four = accounts[4];
        await config.flightSuretyApp.registerAirline(airline_four, {from: config.owner});


        // ACT
        let result = await config.flightSuretyData.isAirline.call(airline_four);

        // ASSERT
        assert.equal(result, false, "Fourth airline is not registered");

    });

    it('(multiparty) registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines', async () => {
        // ARRANGE
        let airline_one = accounts[1];
        await config.flightSuretyApp.registerAirline(airline_one, {from: config.owner});

        let airline_two = accounts[2];
        await config.flightSuretyApp.registerAirline(airline_two, {from: config.owner});

        let airline_three = accounts[3];
        await config.flightSuretyApp.registerAirline(airline_three, {from: config.owner});

        let airline_four = accounts[4];

        // ACT
        const registrationStatus = await config.flightSuretyApp
            .registerAirline
            .call(airline_four, {from: config.owner});

        const status = await config.flightSuretyData.isAirline.call(airline_four);
        assert.equal(status, false, "Voting needed for 5th airline");

        if (registrationStatus[0] === false && registrationStatus[1].toNumber() === 0) {
            await config.flightSuretyApp.approveAirlineRegistration(airline_four, {from: config.owner});
            await config.flightSuretyApp.approveAirlineRegistration(airline_four, {from: airline_two});
            await config.flightSuretyApp.approveAirlineRegistration(airline_four, {from: airline_three});
        }

        await config.flightSuretyApp.registerAirline(airline_four, {from: config.owner});
        const result = await config.flightSuretyData.isAirline.call(airline_four);

        assert.equal(result, true, "multi-party consensus of 50% working");
    });

    it('(airline) can be registered, but does not participate in contract until it submits funding of 10 ether', async () => {
        // ARRANGE
        let airline_two = accounts[2];

        await config.flightSuretyApp.registerAirline(airline_two, { from: config.owner });

        let result = await config.flightSuretyData.isAirlineOperational.call(airline_two);

        // ACT
        let fundAmount = web3.utils.toWei("10", "ether");
        await config.flightSuretyApp.fund({ from: airline_two, value: fundAmount });

        result = await config.flightSuretyData.isAirlineOperational.call(airline_two);

        // ASSERT
        assert.equal(result, true, "Airline is operational");
    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {

        // ARRANGE
        let newAirline = accounts[6];

        // ACT
        try {
            await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
        } catch (e) {

        }
        let result = await config.flightSuretyData.isAirline.call(newAirline);

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

    });

});
