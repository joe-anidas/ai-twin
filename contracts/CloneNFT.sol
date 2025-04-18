// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CloneNFT is ERC721URIStorage, Ownable {
    uint256 public tokenIdCounter;
    address public monadVerifier;

    // Mapping to store the AI twin metadata
    mapping(uint256 => string) public cloneMetadata;

    // Event for minting AI clone NFTs
    event CloneMinted(address indexed owner, uint256 tokenId, string metadataURI);

    // Constructor to set MonadVerifier contract address
    constructor(address _monadVerifier) ERC721("AICloneNFT", "AIClone") {
        monadVerifier = _monadVerifier;
        tokenIdCounter = 1;
    }

    // Mint a new AI Clone NFT
    function mintClone(address to, string memory metadataURI) external onlyOwner {
        uint256 newTokenId = tokenIdCounter;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        cloneMetadata[newTokenId] = metadataURI;  // Store the metadata

        tokenIdCounter++;

        emit CloneMinted(to, newTokenId, metadataURI);
    }

    // Function to update AI clone metadata
    function updateMetadata(uint256 tokenId, string memory newMetadataURI) external {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this clone");
        _setTokenURI(tokenId, newMetadataURI);
        cloneMetadata[tokenId] = newMetadataURI;
    }

    // Function to get metadata URI
    function getCloneMetadata(uint256 tokenId) external view returns (string memory) {
        return cloneMetadata[tokenId];
    }

    // Function to verify ownership
    function verifyOwnership(address user, uint256 tokenId) external view returns (bool) {
        return ownerOf(tokenId) == user;
    }
}
