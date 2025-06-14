// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "contracts/TokensERC1155.sol";
import "node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "node_modules/@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Market is Initializable,  OwnableUpgradeable {
    uint256 implementetionVersion;
    /* покупка и продажа NFT, FT моего TokenERC1155 */
    TokensERC1155 public token;

    /* массивы нужны, чтобы фронтенду было проще отображать NFT в маркете */
    /* он будет брать из массива id, смотреть в priceNFT цену и только 
    тогда отображать для продажи */
    uint256[] public idsNFTExhibited;
    uint256[] public idsFTExhibited; 
    /* массив нужен, чтобы зафиксировать адреса аккаунтов, которые 
    выставили свои NFT на продажу */
    /* пользователю не протребуется делать апрув всех токенов, ему достаточно перевести
    свой токен на адрес контракта, установить цену и он автоматически поступит в продажу 
    */
    mapping(uint256 id => address tokenOwner) public exhibitedNFTOwners; 

    /* в случае с FT цена подразумевается за 1 токен withDecimals дают uint wei, 
    который тут и фиксируется */
    mapping(uint256 id => uint256 price) private _priceNFT;
    mapping(uint256 id => uint256 price) private _priceFT;

    /* для создание очереди нам потребуется head, tail */
    /* они могут в какой-то момент переполниться, но эту проблему 
    мы решим за счет upgradable-proxy. сделаем возможным добавлять новые версии 
    этого контракта */
    // uint256 private queueHead;
    // uint256 private queueTail;

    mapping(uint256 id => uint256 head) private _queueHead;
    mapping(uint256 id => uint256 tail) private _queueTail;

    /* создадим для очереди параллельные мэппинги */
    mapping(uint256 id => mapping(uint256 queueIndex => uint256 value)) private valueInQueue;
    mapping(uint256 id => mapping(uint256 queueIndex => address seller)) private sellerInQueue;

    /* отдельный мэппинг, чтобы можно было следить за своей очередью и чтобы
    можно было выйти из очереди */
    /* сделать так, чтобы при продаже FT в это мэппинге регистрировалось место 
    адреса в очереди */
    /* отсюда тоже нужно удалять, если забирают токены из очереди */
    mapping(uint256 id => mapping(address seller => uint256[] queueIndexs)) private _placeInQueue;

    /* до востребования */
    mapping(address seller => uint256 value) private _toWithdraw; 
     
    /* используем intitialize для прокси */
    function initialize(address payable _token) external initializer {
        __Ownable_init(msg.sender); 
        token = TokensERC1155(_token);
        implementetionVersion = 1; 
    }

    /* эти модификаторый проверяют не только FT это или NFT, но и существует 
    ли токен, тк если его нет в контракте нашего токена, supply будет 0 */
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

    /* посмотреть место в очереди на продажу FT */
    function getPlaceInQueue(uint256 id) public view returns(uint256[] memory) {
        require(_placeInQueue[id][msg.sender].length != 0, "You didn't join queque!");
        return _placeInQueue[id][msg.sender];
    }

    function getQueueHead(uint256 id) public view returns(uint256) {
        return _queueHead[id]; 
    }

    function getQueueTail(uint256 id) public view returns(uint256) {
        return _queueTail[id]; 
    }

    function getValueInQueue(uint256 id, uint256 queueIndex) public view returns(uint256) {
        return valueInQueue[id][queueIndex]; 
    }

    function getSellerInQueue(uint256 id, uint256 queueIndex) public view returns(address) {
        return sellerInQueue[id][queueIndex]; 
    }

    /* может посмотреть, сколько eth доступно для вывода*/
    function toWithdraw() public view returns(uint256){
        return _toWithdraw[msg.sender];
    }

    function getPriceNFT(uint256 id) public view returns(uint256) {
        require(_priceNFT[id] != 0, "Haven't price!"); 
        return _priceNFT[id];
    } /* с этими функциями фронтенд будет работать по той логике, что 
    цена не может быть нулевой, если она нулевая, то токен во фронте 
    не отображается */

    function getPriceFT(uint256 id) public view returns(uint256) {
        require(_priceFT[id] != 0, "Haven't price!"); 
        return _priceFT[id];
    }

    /* перегруженная функция исключительно для покупки NFT */
    function buyNFT(uint256 id) public payable onlyNFT(id) {
        require(token.balanceOf(address(this), id) == 1, "Token doesn't sell!");
        require(_priceNFT[id] > 0, "Cost isn't yet set!");

        require(msg.value == _priceNFT[id], "Value isn't correct!");

        /* вырезаем из массива экспонирования и получаем владельца токена, 
        которому записывам прибыль до востребования */
        address tokenOwner = _removeFromExhibit(id);

        /* отправляем средства в мэппинг до востребования */
        _toWithdraw[tokenOwner] += msg.value;

        /* отправляем покупателю */
        token.safeTransferFrom(address(this), msg.sender, id, 1, "");
    }

    /* вырезать NFT нужно, чтобы они не отображались во фронтенде, 
    тк FT будет не так много, их не нужно вырезать из массива экспонирования,
    даже если их объем к продаже будет нулевым */
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

                /* средства к получению записываются в мэппинг до востребования */
                _toWithdraw[sellerInQueue[id][i]] += valueForTransfer * _priceFT[id];
                
                newQueueHead = i; 
                for(uint256 n = _queueHead[id]; n < newQueueHead; n++) {
                    uint256 _valueForTransfer = valueInQueue[id][n];
                    address currentSeller = sellerInQueue[id][n];
                    delete valueInQueue[id][n];
                    delete sellerInQueue[id][n];

                    /* тут тоже вместо перевода делаем средства до востребования */
                    _toWithdraw[currentSeller] += _valueForTransfer * _priceFT[id];
                }
                break;
            }
        }

        _queueHead[id] = newQueueHead; 
        /* переводим ему токены, которые он купил */
        token.safeTransferFrom(address(this), msg.sender, id, value, "");
    }

    /* тут может забрать свой NFT, который выставлял на продажу */
    /* можено сделать аналогичную batch функцию */
    function stopExhibitNFT(uint256 id) public onlyNFT(id) {
       
        require(exhibitedNFTOwners[id] == msg.sender, "Your aren't an this token owner!");

        /* вырезаем из массива экспонирования */
        _removeFromExhibit(id);

        /* отправляем этот NFT владельцу */
        token.safeTransferFrom(address(this), msg.sender, id, 1, "");
    }  

    function stopExhibitNFTBatch(uint256[] calldata ids) public {
        uint256[] memory values = new uint256[](ids.length);

        for(uint256 i = 0; i < ids.length; i++) {
            require(exhibitedNFTOwners[ids[i]] == msg.sender, "Your aren't an this token owner!");

            /* вырезаем из массива экспонирования */
            _removeFromExhibit(ids[i]);

            values[i] = 1;
        }

        token.safeBatchTransferFrom(address(this), msg.sender, ids, values, "");
    } 

    /* логика удаления из очереди с возвратом тех токенов, которые не были
        проданы за время экспонирования. для того 
        ,чтобы забрать eth, полученный
        от продажи части токенов, нужно обратиться в отдельную функцию (withdrawETH) */
    function stopExhibitFT(uint256 id) public onlyFT(id) {        
        uint256[] memory placeInQueue = _placeInQueue[id][msg.sender];
        uint256 tokenValueForTransfer;

        require(placeInQueue.length != 0, "You didn't join in queque!");
        for(uint256 i = 0; i < placeInQueue.length; i++) {
            tokenValueForTransfer += valueInQueue[id][placeInQueue[i]];

            require(tokenValueForTransfer != 0, "Value equal 0!"); 
            address tokenOwner = sellerInQueue[id][placeInQueue[i]];
            require(tokenOwner == msg.sender, "You are not an tokens owner!"); 
            /* место в очереди как бы остается занятым, но value там уже не будет 
            иначе убрать из мэппинга в этой очереди никак */
            delete valueInQueue[id][placeInQueue[i]];
            delete sellerInQueue[id][placeInQueue[i]]; 
        }

        /* выполняем перевод на адрес владельца токена */
        token.safeTransferFrom(address(this), msg.sender, id, tokenValueForTransfer, "");

    }

    /* тут можно забрать только свой эфир, который получил от продажи FT или NFT */
    function withdrawETH() public {
        require(_toWithdraw[msg.sender] > 0, "You haven't value for withdraw!");

        uint256 value = _toWithdraw[msg.sender];
        _toWithdraw[msg.sender] = 0; 

        (bool res,) = msg.sender.call{value: value}("");
        require(res, "Tx failed!");
    }

    /* цену на Ft токены устанавливает владелец контракта */
    function setPriceFT(uint256 id, uint256 price) public onlyOwner onlyFT(id) {
        require(price > 0, "Incorrect price!");
        _priceFT[id] = price;
    }

    /* пока не установлена цена, продажа не осуществляется, то есть 
    токен на уровне контракта невозможно купить тк стоят require */
    function setPriceNFTBatch(
        uint256[] calldata ids,
        uint256[] calldata price
    ) public {
        require(ids.length == price.length, "Incorrect arrays length!");

        for(uint256 i = 0; i < ids.length; i++) {
            require(price[i] > 0, "Incorrect price!");
            require(token.totalSupply(ids[i]) == 1, "Only NFT!");
            
            /* только владелец токена может поставить цену */
            require(exhibitedNFTOwners[ids[i]] == msg.sender, "You aren't token owner or NFT isn't exhibited!");
        
            _priceNFT[ids[i]] = price[i];
        }}
    

    /* будет выполняться, когда на адрес Market выполнят safeTransferFrom. Market получит
    на баланс токены */
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
            /* тут важен порядок исполнения этих функций, тк _joinQueue 
            проверяет, что value > 1 */
            _joinQueue(from, id, value); 
            _joinExhibitedFT(id);
        }

        return this.onERC1155Received.selector;
    }

    /* отредактировать такж как в onERC1155Received */
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
                /* тут важен порядок исполнения этих функций, тк _joinQueue 
                проверяет, что value > 1 */
                _joinQueue(from, ids[i], values[i]);
                _joinExhibitedFT(ids[i]);
            }
        }
        

        return this.onERC1155BatchReceived.selector;
    }

    function _joinQueue(address from, uint256 id, uint256 value) internal {
        /* подумать какие проверки нужно провести, прежде чем выполнить 
            запись в мэппинги */
            /* тут мы добавили эту заявку на продажу FT в конец очереди */
            require(value > 1, "Incorrect value");
            uint256 tail = _queueTail[id];
            require(tail < type(uint256).max, "Queue is overflow!");
            valueInQueue[id][tail] = value;
            sellerInQueue[id][tail] = from;
            /* зафиксировали место в очереди для возможности удаления из
            очереди и просмотра своего места в очереди */
            _placeInQueue[id][from].push(tail);
            
            _queueTail[id]++;
    }

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

    function _joinExhibitedNFT(address from, uint256 id) internal {
        idsNFTExhibited.push(id);
            /* записываем владельца, чтобы перевести ему средства после продажи или 
            чтобы этот адрес мог вывести свой токен с продажи */
        exhibitedNFTOwners[id] = from; 
    }

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
        /* также удаляем цену NFT из массива*/
        delete _priceNFT[id];

        return tokenOwner;
    }

    receive() external payable {
        require(false, "I dont receive!");
    }

    fallback() external payable {
        require(false, "This function doesn't exists!");
    }
}
