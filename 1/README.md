# Challenge Overview
- **Name:** Challenge 1
- **Category:** Smart Contract Exploitation
- **Objective:** Mint the NFT associated with Challenge 1.

# Contract Code

```solidity
//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface INFTFlags {
    function mint(address _recipient, uint256 _challengeId) external;
}

contract Challenge1 {
    address public nftContract;
    mapping(address => string) public builderNames;

    event BuilderInit(address indexed player, string name);

    constructor(address _nftContract) {
        nftContract = _nftContract;
    }

    function registerMe(string memory _name) public {
        require(bytes(_name).length > 0, "Name cannot be empty");

        builderNames[msg.sender] = _name;
        emit BuilderInit(msg.sender, _name);
        INFTFlags(nftContract).mint(msg.sender, 1);
    }
}
```

# Vulnerability Analysis

The function registerMe mints an NFT for the caller without any strict access control or validation. Since there is no check to prevent repeated calls, anyone can call this function multiple times to mint multiple NFTs.

# Exploit Execution

To exploit this vulnerability, we simply call the registerMe function with any non-empty name. Below is an example of how to execute the exploit using a simple script:

`await contract.registerMe("exploit_name");`

The exploit can be repeated multiple times to mint several NFTs.

# Result & Impact

By exploiting this vulnerability, multiple NFTs can be minted for the same address. This could lead to an unintended distribution of NFTs, diluting their value and potentially affecting the integrity of the system.

# Fix Recommendation

To mitigate this vulnerability:
1. Restrict access to the registerMe function using access control mechanisms like Ownable or Whitelist.
2. Implement a check to prevent multiple registrations by the same address:

```solidity
require(bytes(builderNames[msg.sender]).length == 0, "Already registered");
```

This ensures each address can only mint one NFT through the registerMe function.