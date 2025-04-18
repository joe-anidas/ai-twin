// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CloneNFT is ERC721URIStorage, Ownable {
    uint256 public tokenIdCounter;
    address public monadVerifier;

    mapping(uint256 => string) public cloneMetadata;
    event CloneMinted(address indexed owner, uint256 tokenId, string metadataURI);

    constructor(address _monadVerifier) ERC721("AICloneNFT", "AIClone") {
        monadVerifier = _monadVerifier;
        tokenIdCounter = 1;
    }

    function mintClone(address to, string memory metadataURI) external {
        uint256 newTokenId = tokenIdCounter;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        cloneMetadata[newTokenId] = metadataURI;
        tokenIdCounter++;
        emit CloneMinted(to, newTokenId, metadataURI);
    }

    function updateMetadata(uint256 tokenId, string memory newMetadataURI) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _setTokenURI(tokenId, newMetadataURI);
        cloneMetadata[tokenId] = newMetadataURI;
    }

    function getCloneMetadata(uint256 tokenId) external view returns (string memory) {
        return cloneMetadata[tokenId];
    }

    function verifyOwnership(address user, uint256 tokenId) external view returns (bool) {
        return ownerOf(tokenId) == user;
    }
}