// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.28;

import "node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "node_modules/@openzeppelin/contracts/utils/Strings.sol";
import "contracts/ITokensERC1155.sol";

/* Best practice - это наследование от контрактов, а не от 
интерфейсов */ /* в консп */

contract TokensERC1155 is
    ITokensERC1155,
    ERC1155,
    ERC1155Pausable,
    ERC1155Supply,
    ERC1155Burnable
{
    using Strings for uint256;

    address public immutable owner;
    uint256 private _currentTokenId = 0;
    mapping(uint256 tokenId => string) private _tokenURIs;

    constructor() ERC1155("") {
        owner = msg.sender;
    }

    /* подумать, что еще тут может потребоваться */

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner!");
        _;
    }

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

    /** @dev
     * This function for mint new FT
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

    /** @dev
     * This function for mint FT that minted before
     */
    function mintFT(address to, uint256 id, uint256 value) external onlyOwner {
        require(value > 1, "Amount must be more then 1!");

        _mint(to, id, value, "");
    }

    /* будте подходить только для случаев, если мы всю коллекцию
    минтим на один адрес */
    /** @dev
     * This function for mint NFT collection
     * We don't recommend mint tokens on Market address
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
        /* сделаем ограничение на батч, тк слишком большой батч
        может упереться в лимиты по газу */ /* в консп */
        /* также в README нужно упомянуть, что существует ограничение 
        на батч из-за возможности превысить газ */
        require(values.length == collectionLength, "Incorrect length!");

        uint256[] memory ids = new uint256[](collectionLength);
        /* возможно где-то в README упомянуть, что этот контракт 
        предназначен только для создания коллекции, в которой 
        по одному экзепляру каждого NFT */
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
        ); /* в консп */ /* мы можем отправить 
        пустую строку, если функция ожидает bytes, она автоматом 
        конвертируется в 0x */ /* а также любой string можно передать 
        в bytes, но не наоборот */
    }

    /* вывод только для токенов */
    /* вывод одного токена (NFT или FT) */
    function withdrawSingle(uint256 id) public onlyOwner {
        uint256 currentBalance = balanceOf(address(this), id);

        _safeTransferFrom(address(this), owner, id, currentBalance, "");
    }

    /* массив с accounts - это массив наполненный одним адресом данного контракта. 
    создается во фронтенде */
    /* вывод любых токенов (FT или NFT) в формате Batch. Исключительно на адрес
    owner этого контракта */
    function withdrawBatch(
        uint256[] memory ids,
        address[] memory accounts
    ) public onlyOwner {
        require(ids.length == accounts.length, "Incorrect length!"); 
        uint256[] memory currentBalances = new uint256[](ids.length);

        currentBalances = balanceOfBatch(accounts, ids);

        _safeBatchTransferFrom(address(this), owner, ids, currentBalances, "");
    }

    receive() external payable {
        require(false, "I dont receive ETH!");
    }

    /* ERC1155 не имеет встроенного метода для проверки наличия токенов на адресе 
    (речь о тех случаях, когда мы не знаем id токенов */
    /* можно простоить этот метод во фронтенде, используя balanceOfBatch из контракта
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

    /* Можно указать это в README, что данный ERC1155 не принимает 
    сторонних токенов ERC1155 */

    function _setURI(uint256 tokenId, string memory tokenURI) internal {
        _tokenURIs[tokenId] = tokenURI;
        emit URI(uri(tokenId), tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, IERC165) returns (bool) {
        return
            interfaceId == type(ITokensERC1155).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /* Можно указать это в README, что данный ERC1155 не принимает 
    сторонних токенов ERC1155 */

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
    } /* обязательно переопределяем для ERC1155URIStorage для корректной работы URIStorage */ /* если мы 
    не используем ERC1155URIStorage, то нам не требуется делать переопредление с 
    override(ERC1155, ERC1155URIStorage)*/ /* в консп */

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        super._update(from, to, ids, values);
    } /* обязательно переопределяем для корректной работы */ /* в консп */
}
