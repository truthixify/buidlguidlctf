import Web3 from 'web3';
const web3 = new Web3();

const msgSender = "0x3B465D0695621f330a45BCc15fcF6B2d8f2046d6";
const message = web3.utils.soliditySha3("BG CTF Challenge 4", msgSender);
const ethSignedMessage = web3.eth.accounts.hashMessage(message);

console.log("Message Hash:", message);
console.log("Eth Signed Message Hash:", ethSignedMessage);

const recovered = web3.eth.accounts.recover(ethSignedMessage, "0xe685902df4c138d6458f2893c4807319d0e2cb25809738dd443aa9c017cae7f46915519d3b340ddce5c46e4192a97a9644c254f6aaf20dd96103ea0a7c08d54c1b");

console.log("Recovered Signer:", recovered);