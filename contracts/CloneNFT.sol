// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  // Updated compiler version

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract CloneNFT is ERC721 {
    using Address for address payable;
    
    uint256 private _tokenIdCounter;
    address public monadVerifierAddress;

    struct CloneMetadata {
        string name;
        string role;
        address ownerWallet;
        string modelHash;
        bool licenseEnabled;
        uint256 creationTimestamp;
    }

    mapping(uint256 => CloneMetadata) public cloneData;
    mapping(address => uint256[]) public userTokens;
    mapping(bytes32 => bool) public verifiedInferences;

    event CloneMinted(address indexed owner, uint256 tokenId, string modelHash);
    event LicenseUpdated(uint256 tokenId, bool newStatus);
    event InferenceVerified(bytes32 indexed inferenceId, uint256 tokenId);

    constructor(address _monadVerifier) ERC721("AI Clone", "CLONE") {
        monadVerifierAddress = _monadVerifier;
    }

    // Main mint function moved up
    function mintClone(
        string memory name,
        string memory role,
        string memory modelHash,
        bool licenseEnabled
    ) external {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        
        cloneData[tokenId] = CloneMetadata({
            name: name,
            role: role,
            ownerWallet: msg.sender,
            modelHash: modelHash,
            licenseEnabled: licenseEnabled,
            creationTimestamp: block.timestamp
        });

        userTokens[msg.sender].push(tokenId);
        emit CloneMinted(msg.sender, tokenId, modelHash);
    }

    function batchMintClones(
        string[] memory names,
        string[] memory roles,
        string[] memory modelHashes,
        bool[] memory licenseStatuses
    ) external {
        require(names.length == roles.length, "Array length mismatch");
        require(names.length == modelHashes.length, "Array length mismatch");
        require(names.length == licenseStatuses.length, "Array length mismatch");

        for (uint256 i = 0; i < names.length; i++) {
            this.mintClone(names[i], roles[i], modelHashes[i], licenseStatuses[i]);
        }
    }

    function updateLicenseStatus(uint256 tokenId, bool newStatus) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not owner/approved");
        cloneData[tokenId].licenseEnabled = newStatus;
        emit LicenseUpdated(tokenId, newStatus);
    }

    function verifyInference(
        uint256 tokenId,
        string memory inputData,
        string memory outputData
    ) external {
        require(_exists(tokenId), "Invalid token");
        bytes32 inferenceId = keccak256(abi.encodePacked(inputData, outputData));
        verifiedInferences[inferenceId] = true;
        emit InferenceVerified(inferenceId, tokenId);
    }

    function getCloneMetadata(uint256 tokenId) public view returns (
        string memory, string memory, address, string memory, bool, uint256
    ) {
        require(_exists(tokenId), "Invalid token");
        CloneMetadata memory data = cloneData[tokenId];
        return (
            data.name,
            data.role,
            data.ownerWallet,
            data.modelHash,
            data.licenseEnabled,
            data.creationTimestamp
        );
    }

    function getAllModelsByUser(address user) public view returns (
        uint256[] memory, 
        string[] memory, 
        bool[] memory
    ) {
        uint256[] memory tokenIds = userTokens[user];
        string[] memory modelHashes = new string[](tokenIds.length);
        bool[] memory licenseStatuses = new bool[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            CloneMetadata memory data = cloneData[tokenIds[i]];
            modelHashes[i] = data.modelHash;
            licenseStatuses[i] = data.licenseEnabled;
        }

        return (tokenIds, modelHashes, licenseStatuses);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://base-optimized-uri.example.com/metadata/";
    }
}