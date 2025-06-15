// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "contracts/TokensERC1155.sol";
import "node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "node_modules/@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title Market
 * @notice Marketplace contract for buying, selling, and exchanging NFT and FT tokens
 * based on a custom ERC1155 implementation.
 * @dev Supports upgradeability via Initializable & OwnableUpgradeable. 
 * Manages queue-based FT order book and non-custodial ETH withdrawal for sellers.
 */
contract Market is Initializable,  OwnableUpgradeable {
    /**
     * @notice Current implementation version of the Market 
     * contract (for upgradeability)
     */ 
    uint256 implementetionVersion;
    
    TokensERC1155 public token;

    /// @notice Lists of NFT, FT IDs currently exhibited for sale
    uint256[] public idsNFTExhibited;
    uint256[] public idsFTExhibited; 
    
    /**
     * @notice Maps NFT IDs to the address of the current 
     * owner who exhibited it for sale
     * @dev User only needs to transfer token to contract and 
     * set price, no global approval required
     */
    mapping(uint256 id => address tokenOwner) public exhibitedNFTOwners; 

    /// @notice NFT, FT prices in wei
    mapping(uint256 id => uint256 price) private _priceNFT;
    mapping(uint256 id => uint256 price) private _priceFT;

    /// @notice FT sale queues: head and tail pointers
    mapping(uint256 id => uint256 head) private _queueHead;
    mapping(uint256 id => uint256 tail) private _queueTail;

    /** 
     * @notice FT sale queue: amount and seller of tokens 
     * for sale at queue index
     */
    mapping(uint256 id => mapping(uint256 queueIndex => uint256 value)) private valueInQueue;
    mapping(uint256 id => mapping(uint256 queueIndex => address seller)) private sellerInQueue;

    /**
     * @notice For each FT, tracks queue positions for each seller 
     * (enables sellers to track/cancel their sales)
     * @dev Should be cleaned up when tokens are withdrawn from the queue
     */
    mapping(uint256 id => mapping(address seller => uint256[] queueIndexs)) private _placeInQueue;

    /// @notice ETH owed to sellers, withdrawable on demand
    mapping(address seller => uint256 value) private _toWithdraw; 
     
    /**
     * @notice Initializes the Market contract for proxy use.
     * @param _token Address of the deployed TokensERC1155 contract
     */
    function initialize(address payable _token) external initializer {
        __Ownable_init(msg.sender); 
        token = TokensERC1155(_token);
        implementetionVersion = 1; 
    }

    modifier onlyFT(uint256 id) {
        require(token.totalSupply(id) > 1, "Only FT!");
        _;
    }

    modifier onlyNFT(uint256 id) {
        require(token.totalSupply(id) == 1, "Only NFT!");
        _;
    }

    function getAllIdsNFTExhibited() public view returns (uint256[] memory) {
        return idsNFTExhibited;
    }

    function getAllIdsFTExhibited() public view returns (uint256[] memory) {
        return idsFTExhibited;
    }

    function getImplementetionVersion() view public returns(uint256) {
        return implementetionVersion;
    }

    /**
     * @notice Returns all queue indices for the caller for a given FT ID.
     * @param id FT token ID
     * @return Array of queue indices
     * @dev Reverts if the caller is not in the queue.
     */
    function getPlaceInQueue(uint256 id) public view returns(uint256[] memory) {
        require(_placeInQueue[id][msg.sender].length != 0, "You didn't join queque!");
        return _placeInQueue[id][msg.sender];
    }

    /**
     * @notice Returns the head index for the FT sale queue.
     * @param id FT token ID
     */
    function getQueueHead(uint256 id) public view returns(uint256) {
        return _queueHead[id]; 
    }

    /**
     * @notice Returns the tail index for the FT sale queue.
     * @param id FT token ID
     */
    function getQueueTail(uint256 id) public view returns(uint256) {
        return _queueTail[id]; 
    }

    /**
     * @notice Returns the token amount at a given position in the FT sale queue.
     * @param id FT token ID
     * @param queueIndex Position in the sale queue
     */
    function getValueInQueue(uint256 id, uint256 queueIndex) public view returns(uint256) {
        return valueInQueue[id][queueIndex]; 
    }

    /**
     * @notice Returns the seller at a given position in the FT sale queue.
     * @param id FT token ID
     * @param queueIndex Position in the sale queue
     */
    function getSellerInQueue(uint256 id, uint256 queueIndex) public view returns(address) {
        return sellerInQueue[id][queueIndex]; 
    }

    /// @notice Returns the ETH amount available for withdrawal by the caller.
    function toWithdraw() public view returns(uint256){
        return _toWithdraw[msg.sender];
    }

    /**
     * @notice Returns the price (in wei) for the given NFT ID.
     * @param id NFT ID
     * @dev Reverts if the price is not set.
     */
    function getPriceNFT(uint256 id) public view returns(uint256) {
        require(_priceNFT[id] != 0, "Haven't price!"); 
        return _priceNFT[id];
    }

    /**
     * @notice Returns the price (in wei per token) for the given FT ID.
     * @param id FT token ID
     * @dev Reverts if the price is not set.
     */
    function getPriceFT(uint256 id) public view returns(uint256) {
        require(_priceFT[id] != 0, "Haven't price!"); 
        return _priceFT[id];
    }

    /**
     * @notice Purchases an exhibited NFT for its current price.
     * @param id NFT ID to buy
     * @dev Transfers ETH to seller's withdrawable balance and NFT to buyer.
     * Reverts if NFT is not for sale, price is unset, or payment is incorrect.
     */
    function buyNFT(uint256 id) public payable onlyNFT(id) {
        require(token.balanceOf(address(this), id) == 1, "Token doesn't sell!");
        require(_priceNFT[id] > 0, "Cost isn't yet set!");

        require(msg.value == _priceNFT[id], "Value isn't correct!");

        // Remove from exhibition and record the owner
        address tokenOwner = _removeFromExhibit(id);

        // Credit proceeds to seller
        _toWithdraw[tokenOwner] += msg.value;

        // Transfer NFT to buyer
        token.safeTransferFrom(address(this), msg.sender, id, 1, "");
    }

    /**
     * @notice Purchases a specified amount of FT tokens from the sale queue.
     * @param id FT token ID
     * @param value Amount of tokens to buy
     * @dev Distributes ETH among sellers in queue, updates queue pointers, 
     * transfers tokens to buyer.
     * Reverts if insufficient tokens, price is unset, or payment is incorrect.
     */
    function buyFT(uint256 id, uint256 value) public payable onlyFT(id) {
        require(value <= token.balanceOf(address(this), id), "Have not funds!");
        require(_priceFT[id] > 0, "Cost isn't yet set!"); 
        require(msg.value == _priceFT[id] * value, "Incorrect msg.value!");

        uint256 _currentValue;
        uint256 newQueueHead;

        /* изменяем очередь, отправляем средства */
        for(uint256 i = _queueHead[id]; i < _queueTail[id]; i++) {
            _currentValue += valueInQueue[id][i];
            if (_currentValue >= value) {
                uint256 remainder = _currentValue - value; 
                uint256 valueForTransfer = valueInQueue[id][i] - remainder;

                valueInQueue[id][i] = remainder;

                // Credit proceeds to seller
                _toWithdraw[sellerInQueue[id][i]] += valueForTransfer * _priceFT[id];
                
                newQueueHead = i; 
                for(uint256 n = _queueHead[id]; n < newQueueHead; n++) {
                    uint256 _valueForTransfer = valueInQueue[id][n];
                    address currentSeller = sellerInQueue[id][n];
                    delete valueInQueue[id][n];
                    delete sellerInQueue[id][n];

                    _toWithdraw[currentSeller] += _valueForTransfer * _priceFT[id];
                }
                break;
            }
        }

        _queueHead[id] = newQueueHead; 
        
        // Transfer FT tokens to buyer
        token.safeTransferFrom(address(this), msg.sender, id, value, "");
    }

    /**
     * @notice Removes an exhibited NFT from sale and returns it to the owner.
     * @param id NFT ID to withdraw from sale
     * @dev Reverts if caller is not the owner.
     */
    function stopExhibitNFT(uint256 id) public onlyNFT(id) {
        require(exhibitedNFTOwners[id] == msg.sender, "Your aren't an this token owner!");

        _removeFromExhibit(id);

        token.safeTransferFrom(address(this), msg.sender, id, 1, "");
    }  

    /**
     * @notice Removes multiple exhibited NFTs from sale and returns them to the owner.
     * @param ids Array of NFT IDs to withdraw
     */
    function stopExhibitNFTBatch(uint256[] calldata ids) public {
        uint256[] memory values = new uint256[](ids.length);

        for(uint256 i = 0; i < ids.length; i++) {
            require(exhibitedNFTOwners[ids[i]] == msg.sender, "Your aren't an this token owner!");

            _removeFromExhibit(ids[i]);

            values[i] = 1;
        }

        token.safeBatchTransferFrom(address(this), msg.sender, ids, values, "");
    } 

    /**
     * @notice Removes FT tokens from the sale queue, returning unsold tokens to the seller.
     * @param id FT token ID
     * @dev Reverts if caller is not in queue or not the seller.
     */
    function stopExhibitFT(uint256 id) public onlyFT(id) {        
        uint256[] memory placeInQueue = _placeInQueue[id][msg.sender];
        uint256 tokenValueForTransfer;

        require(placeInQueue.length != 0, "You didn't join in queque!");
        for(uint256 i = 0; i < placeInQueue.length; i++) {
            tokenValueForTransfer += valueInQueue[id][placeInQueue[i]];

            require(tokenValueForTransfer != 0, "Value equal 0!"); 
            address tokenOwner = sellerInQueue[id][placeInQueue[i]];
            require(tokenOwner == msg.sender, "You are not an tokens owner!"); 
            
            delete valueInQueue[id][placeInQueue[i]];
            delete sellerInQueue[id][placeInQueue[i]]; 
        }

        token.safeTransferFrom(address(this), msg.sender, id, tokenValueForTransfer, "");

    }

    /**
     * @notice Withdraws all ETH earned from sales for the calling address.
     * @dev Reverts if nothing is available for withdrawal.
     */
    function withdrawETH() public {
        require(_toWithdraw[msg.sender] > 0, "You haven't value for withdraw!");

        uint256 value = _toWithdraw[msg.sender];
        _toWithdraw[msg.sender] = 0; 

        (bool res,) = msg.sender.call{value: value}("");
        require(res, "Tx failed!");
    }

    /**
     * @notice Sets the price per FT token. Only contract owner can call.
     * @param id FT token ID
     * @param price Price per token (in wei)
     * @dev Reverts if price is invalid.
     */
    function setPriceFT(uint256 id, uint256 price) public onlyOwner onlyFT(id) {
        require(price > 0, "Incorrect price!");
        _priceFT[id] = price;
    }

    /**
     * @notice Sets prices for multiple exhibited NFTs. Only token owner can set price.
     * @param ids Array of NFT IDs
     * @param price Array of prices (in wei)
     * @dev Reverts if caller is not the owner of NFT, or arrays mismatch.
     */
    function setPriceNFTBatch(
        uint256[] calldata ids,
        uint256[] calldata price
    ) public {
        require(ids.length == price.length, "Incorrect arrays length!");

        for(uint256 i = 0; i < ids.length; i++) {
            require(price[i] > 0, "Incorrect price!");
            require(token.totalSupply(ids[i]) == 1, "Only NFT!");
            
            require(exhibitedNFTOwners[ids[i]] == msg.sender, "You aren't token owner or NFT isn't exhibited!");
        
            _priceNFT[ids[i]] = price[i];
        }}
    

    /**
     * @notice Handles receipt of a single ERC1155 token type.
     * @param from Address which sent the token
     * @param id Token ID received
     * @param value Amount received
     * @dev If NFT, adds to exhibition; if FT, adds to queue and exhibition list.
     */
    function onERC1155Received(
        address,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata
    ) external returns (bytes4) {
        require(token.exists(id), "Only minted token!");

        uint256 supply = token.totalSupply(id);

        if (supply == 1) {
            _joinExhibitedNFT(from, id);
        }
        
        if (supply > 1) {
            _joinQueue(from, id, value); 
            _joinExhibitedFT(id);
        }

        return this.onERC1155Received.selector;
    }

    /**
     * @notice Handles receipt of multiple ERC1155 token types in batch.
     * @param from Address which sent the tokens
     * @param ids Token IDs received
     * @param values Amounts received per token
     * @dev For each: if NFT, adds to exhibition; if FT, adds to queue and exhibition list.
     */
    function onERC1155BatchReceived(
        address,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata
    ) external returns (bytes4) {
        for (uint256 i = 0; i < ids.length; i++) {
            require(token.exists(ids[i]), "Only minted tokens!");
        }

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 supply = token.totalSupply(ids[i]);

            if (supply == 1) {
                _joinExhibitedNFT(from, ids[i]);
            }

            if (supply > 1) {
                _joinQueue(from, ids[i], values[i]);
                _joinExhibitedFT(ids[i]);
            }
        }
        

        return this.onERC1155BatchReceived.selector;
    }

    /**
     * @notice Adds a FT sale request to the end of the sale queue.
     * @param from Seller address
     * @param id FT token ID
     * @param value Amount of tokens for sale
     */
    function _joinQueue(address from, uint256 id, uint256 value) internal {
        require(value > 1, "Incorrect value");

        uint256 tail = _queueTail[id];
        require(tail < type(uint256).max, "Queue is overflow!");

        valueInQueue[id][tail] = value;
        sellerInQueue[id][tail] = from;

        _placeInQueue[id][from].push(tail);
            
        _queueTail[id]++;
    }

    /**
     * @notice Adds FT ID to the exhibition list if not already present.
     * @param id FT token ID
     */
    function _joinExhibitedFT(uint256 id) internal {
        if(idsFTExhibited.length == 0) {
            idsFTExhibited.push(id);
        } else {
            for(uint256 i = 0; i < idsFTExhibited.length; i++) {
                if(idsFTExhibited[i] == id ) {
                    break;
                }

                if(idsFTExhibited[i] != id && i+1 == idsFTExhibited.length) {
                    idsFTExhibited.push(id);
                }
            }
        }
        
    }

    /**
     * @notice Adds NFT ID to the exhibition list and records owner.
     * @param from Owner address
     * @param id NFT ID
     */
    function _joinExhibitedNFT(address from, uint256 id) internal {
        idsNFTExhibited.push(id);
        exhibitedNFTOwners[id] = from; 
    }

    /**
     * @notice Removes NFT from exhibition list and clears its price.
     * @param id NFT ID
     * @return tokenOwner Address of the owner
     */
    function _removeFromExhibit(uint256 id) internal returns(address) {
        address tokenOwner;

        for (uint256 i = 0; i < idsNFTExhibited.length; i++) {
            if (idsNFTExhibited[i] == id) { 
                idsNFTExhibited[i] = idsNFTExhibited[idsNFTExhibited.length-1];
                idsNFTExhibited.pop();
                tokenOwner = exhibitedNFTOwners[i];
                exhibitedNFTOwners[id] = address(0);
            }
        }
        delete _priceNFT[id];

        return tokenOwner;
    }

    /**
     * @dev Rejects direct ETH transfers.
     */
    receive() external payable {
        require(false, "I dont receive!");
    }

     /**
     * @dev Rejects calls to non-existent functions.
     */
    fallback() external payable {
        require(false, "This function doesn't exists!");
    }
}
