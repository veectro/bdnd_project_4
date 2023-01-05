var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "lake delay truth theory rail buyer copper strategy first stadium ship rich";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 6721975
    },
    // https://knowledge.udacity.com/questions/38069
    developmentOld: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
      },
      network_id: '*',
      websockets: true
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};