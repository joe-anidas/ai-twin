// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CloneNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 public tokenIdCounter;
    mapping(uint256 => string) public cloneMetadata;

    event CloneMinted(address indexed owner, uint256 tokenId, string metadataURI);
    event CloneBurned(uint256 tokenId);

    constructor() ERC721("AICloneNFT", "AIClone") {
        tokenIdCounter = 1;
    }

    // ================== Added Functionality ==================
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function isOwnerOf(address account, uint256 tokenId) public view returns (bool) {
        return exists(tokenId) && ownerOf(tokenId) == account;
    }

    function burn(uint256 tokenId) external {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "Not owner nor approved"
        );
        _burn(tokenId);
        emit CloneBurned(tokenId);
    }

    // ================== Original Functionality ==================
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

    // ================== Required Overrides ==================
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete cloneMetadata[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}