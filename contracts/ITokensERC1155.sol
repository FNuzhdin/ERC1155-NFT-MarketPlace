// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface ITokensERC1155 is IERC1155 {
    function currentTokenId() external view returns (uint256);

    function pause() external;

    function unpause() external;

    function mint(address to, string memory tokenURI, uint256 value) external;

    function mint(
        address to,
        string memory tokenURI,
        uint256 collectionLength,
        uint256[] memory values
    ) external;

    function withdraw(uint256 id) external;

    function withdraw(uint256[] memory ids, address[] memory accounts) external;

    function onERC1155Received(
        address,
        address,
        uint256 id,
        uint256,
        bytes calldata
    ) external view returns(bytes4);

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata ids,
        uint256[] calldata,
        bytes calldata
    ) external view returns(bytes4);

    function uri(uint256 tokenId) external view returns(string memory);

    /* добавить оставльные кастомные селекторы функций */
}
