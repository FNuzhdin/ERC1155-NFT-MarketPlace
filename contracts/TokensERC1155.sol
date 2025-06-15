// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.28;

import "node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "node_modules/@openzeppelin/contracts/utils/Strings.sol";
import "contracts/ITokensERC1155.sol";

/**
 * @title TokensERC1155
 * @notice Custom ERC1155 smart-contract for minting fungible and non-fungible tokens (NFTs & FTs),
 * supporting collections, pausing, burning, and supply tracking.
 * @dev Compatible with OpenZeppelin Contracts ^5.0.0. Owner-only minting. 
 * Batch and single minting supported. 
 * Enforces URI management, collection minting limits, and batch withdrawal for owner.
 */
contract TokensERC1155 is
    ITokensERC1155,
    ERC1155,
    ERC1155Pausable,
    ERC1155Supply,
    ERC1155Burnable
{
    using Strings for uint256;

    /// @notice The owner of the contract, allowed to mint or pause/unpause.
    address public immutable owner;

    /// @notice The current token ID to be assigned to the next minted token.
    uint256 private _currentTokenId = 0;
    mapping(uint256 tokenId => string) private _tokenURIs;

    constructor() ERC1155("") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner!");
        _;
    }

    /**
     * @notice Ensures the URI is not empty and collection minting does not exceed max supply.
     * @param tokenURI The metadata URI for the token or collection
     * @param collectionLength Number of tokens to mint in batch (should not overflow)
     */
    modifier reqSupplyURI(string memory tokenURI, uint256 collectionLength) {
        require(bytes(tokenURI).length > 0, "Empty URI!");
        require(
            _currentTokenId + collectionLength < type(uint256).max,
            "Max totalSupply reached!"
        );
        _;
    }

    function currentTokenId() public view onlyOwner returns (uint256) {
        return _currentTokenId;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @notice Mints a new fungible token (FT).
     * @dev Only owner can mint. Value must be greater than 1.
     * @param to Recipient address
     * @param tokenURI Metadata URI for the FT
     * @param value Amount of tokens to mint (must be > 1)
     */
    function mintNewFT(
        address to,
        string memory tokenURI,
        uint256 value
    ) external reqSupplyURI(tokenURI, 1) onlyOwner {
        require(value > 1, "Amount must be more then 1!");

        _mint(to, _currentTokenId, value, "");
        _setURI(_currentTokenId, tokenURI);
        _currentTokenId++;
    }

    /**
     * @notice Mints additional amount for an existing FT (token ID).
     * @dev Only owner can mint. Value must be greater than 1.
     * @param to Recipient address
     * @param id Token ID to mint
     * @param value Amount of tokens to mint (must be > 1)
     */
    function mintFT(address to, uint256 id, uint256 value) external onlyOwner {
        require(value > 1, "Amount must be more then 1!");

        _mint(to, id, value, "");
    }

    /**
     * @notice Mints a collection of NFTs (each with unique token ID & shared URI).
     * @dev Only owner can mint. Collection size limited to 2-50 for gas reasons.
     * Each NFT in collection has unique tokenId, value and same URI.
     * Not recommended to mint to Market contract address.
     * @param to Recipient address
     * @param tokenURI Metadata URI for the collection
     * @param collectionLength Number of NFTs to mint (2-50)
     * @param values Amount per NFT (should be 1 per NFT)
     */
    function mintNFT(
        address to,
        string memory tokenURI,
        uint256 collectionLength,
        uint256[] memory values
    ) external reqSupplyURI(tokenURI, collectionLength) onlyOwner {
        require(
            collectionLength > 1 && collectionLength <= 50,
            "The collection must be 2 to 50 NFT!"
        );
        require(values.length == collectionLength, "Incorrect length!");

        uint256[] memory ids = new uint256[](collectionLength);
        for (uint256 i = 0; i < collectionLength; i++) {
            ids[i] = _currentTokenId;
            _currentTokenId++;

            _setURI(ids[i], tokenURI);
        }

        _mintBatch(
            to,
            ids,
            values,
            ""
        );
    }

    /**
     * @notice Withdraws all tokens of a given ID (NFT or FT) from the contract to the owner.
     * @param id Token ID to withdraw
     */
    function withdrawSingle(uint256 id) public onlyOwner {
        uint256 currentBalance = balanceOf(address(this), id);

        _safeTransferFrom(address(this), owner, id, currentBalance, "");
    }

    /**
     * @notice Batch withdraw of any tokens (NFT or FT) to the owner.
     * @dev Accounts array should be filled with this contract's address.
     * @param ids Token IDs to withdraw
     * @param accounts Array of sender addresses (must match ids length, usually contract address)
     */
    function withdrawBatch(
        uint256[] memory ids,
        address[] memory accounts
    ) public onlyOwner {
        require(ids.length == accounts.length, "Incorrect length!"); 
        uint256[] memory currentBalances = new uint256[](ids.length);

        currentBalances = balanceOfBatch(accounts, ids);

        _safeBatchTransferFrom(address(this), owner, ids, currentBalances, "");
    }

    /**
     * @notice Rejects direct receipt of ETH.
     */
    receive() external payable {
        require(false, "I dont receive ETH!");
    }

    /**
     * @notice Handles ERC1155 single token receipt. Only accepts tokens minted by this contract.
     * @param id Token ID received
     * @return ERC1155 selector for safe transfer
     */
    function onERC1155Received(
        address,
        address,
        uint256 id,
        uint256,
        bytes calldata
    ) external view returns (bytes4) {
        require(exists(id), "Only tokens which minted in this contract!");
        return this.onERC1155Received.selector;
    }

    /**
     * @notice Handles ERC1155 batch token receipt. Only accepts tokens minted by this contract.
     * @param ids Array of token IDs received
     * @return ERC1155 selector for safe batch transfer
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata ids,
        uint256[] calldata,
        bytes calldata
    ) external view returns (bytes4) {
        for (uint256 i = 0; i < ids.length; i++) {
            require(
                exists(ids[i]),
                "Only tokens which minted in this contract!"
            );
        }
        return this.onERC1155BatchReceived.selector;
    }

    /**
     * @notice Sets the URI for a specific token ID.
     * @param tokenId Token ID
     * @param tokenURI Metadata URI
     * @dev Emits a URI event as per ERC1155 spec.
     */
    function _setURI(uint256 tokenId, string memory tokenURI) internal {
        _tokenURIs[tokenId] = tokenURI;
        emit URI(uri(tokenId), tokenId);
    }

    /**
     * @notice Checks if an interface is supported.
     * @param interfaceId Interface identifier
     * @return True if supported, false otherwise
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, IERC165) returns (bool) {
        return
            interfaceId == type(ITokensERC1155).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Returns the URI for a given token ID.
     * @param tokenId Token ID
     * @return The metadata URI
     * @dev For NFTs, returns URI with suffix 'metadata_{tokenId}.json'
     */
    function uri(uint256 tokenId) public view override(ERC1155, ITokensERC1155) returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];

        if(totalSupply(tokenId) > 1) {
            return 
            bytes(tokenURI).length > 0
            ? tokenURI
            : "";
        } else {
            return
                bytes(tokenURI).length > 0
                    ? string.concat(tokenURI, "metadata_", tokenId.toString(), ".json")
                    : "";
            }
    }

    /**
     * @notice Ensures proper update logic for pausable and supply extensions.
     * @dev Internal override required by OpenZeppelin for ERC1155Pausable and ERC1155Supply.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        super._update(from, to, ids, values);
    } 
}
