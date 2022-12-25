var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "found zone belt burger below hole vault veteran loan copy talk company";

module.exports = {
  networks: {
    development: {
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