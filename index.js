import Web3 from 'web3';
const web3 = new Web3('https://optimism-mainnet.infura.io/v3/5a352c10b52845a4a69084f69d767b2a');
const targetAddress = '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a';
const yourAddress = '0x3B465D0695621f330a45BCc15fcF6B2d8f2046d6';

(async () => {
    // Properly encode the message as a hex string
    const message = web3.utils.soliditySha3("BG CTF Challenge 4", yourAddress);
    console.log("Message Hash:", message);

    // Compute the Ethereum-signed message hash
    const ethSignedMessage = web3.eth.accounts.hashMessage(message);
    console.log("Ethereum Signed Message Hash:", ethSignedMessage);

    let found = false;
    let attempts = 0;

    console.log("🔍 Attempting to forge a valid signature...");

    while (!found && attempts < 1000000) {
        attempts++;

        // Generate a random private key
        const randomPrivateKey = web3.utils.randomHex(32);

        // Sign the message hash
        const { signature } = web3.eth.accounts.sign(ethSignedMessage, randomPrivateKey);

        // Recover the address from the signature
        const recoveredAddress = web3.eth.accounts.recover(ethSignedMessage, signature);

        if (recoveredAddress.toLowerCase() === targetAddress.toLowerCase()) {
            console.log("🎉 Success! Found a valid signature:");
            console.log("Signature:", signature);
            console.log("Recovered Address:", recoveredAddress);
            console.log("Random Private Key (for testing):", randomPrivateKey);
            found = true;
        }

        if (attempts % 10000 === 0) {
            console.log(`Attempts: ${attempts}`);
        }
    }

    if (!found) {
        console.log("❌ Failed to forge a valid signature after many attempts.");
    }
})();