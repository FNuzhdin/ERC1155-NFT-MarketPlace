// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "contracts/TokensERC1155.sol";
import "node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract Market {
    /* покупка и продажа NFT, FT моего TokenERC1155 */
    address public immutable owner;
    TokensERC1155 public immutable token;

    /* массивы нужны, чтобы фронтенду было проще отображать NFT в маркете */
    /* он будет брать из массива id, смотреть в priceNFT цену и только 
    тогда отображать для продажи */
    uint256[] public idsNFTExhidited;
    uint256[] public idsFTExhidited; /* исправить везде эту опечатку */

    /* в случае с FT цена подразумевается за 1 токен withDecimals дают uint wei, 
    который тут и фиксируется */
    mapping(uint256 id => uint256 price) private _priceNFT;
    mapping(uint256 id => uint256 price) private _priceFT;

    /* массив нужен, чтобы зафиксировать адреса аккаунтов, которые 
    выставили свои NFT на продажу */
    /* пользователю не протребуется делать апрув всех токенов, ему достаточно перевести
    свой токен на адрес контракта, установить цену и он автоматически поступит в продажу 
    */
    mapping(uint256 id => address tokenOwner) public exhibitedNFTOwners; 

    /* для создание очереди нам потребуется head, tail */
    /* они могут в какой-то момент переполниться, но эту проблему 
    мы решим за счет upgradable-proxy. сделаем возможным добавлять новые версии 
    этого контракта */
    uint256 queueHead;
    uint256 queueTail;

    /* создадим для очереди параллельные мэппинги */
    mapping(uint256 id => mapping(uint256 queueIndex => uint256 value)) private valueInQueue;
    mapping(uint256 id => mapping(uint256 queueIndex => address seller)) private sellerInQueue;

    /* отдельный мэппинг, чтобы можно было следить за своей очередью и чтобы
    можно было выйти из очереди */
    /* сделать так, чтобы при продаже FT в это мэппинге регистрировалось место 
    адреса в очереди */
    /* отсюда тоже нужно удалять, если забирают токены из очереди */
    mapping(address seller => uint256 queueIndex) private _placeInQueue;

    /* до востребования */
    mapping(address seller => uint256 eth) private _toWithdraw; 
    
    constructor(address payable _token) {
        owner = msg.sender;
        token = TokensERC1155(_token);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner!");
        _;
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

    /* посмотреть место в очереди на продажу FT */
    function getPlaceInQueue() public view returns(uint256) {
        return _placeInQueue[msg.sender];
    }

    /* может посмотреть, сколько eth доступно для вывода*/
    function toWithdraw() public view returns(uint256){
        return _toWithdraw[msg.sender];
    }

    function getPriceNFT(uint256 id) public view returns(uint256) {
        return _priceNFT[id];
    } /* с этими функциями фронтенд будет работать по той логике, что 
    цена не может быть нулевой, если она нулевая, то токен во фронте 
    не отображается */

    function getPriceFT(uint256 id) public view returns(uint256) {
        return _priceFT[id];
    }

    /* перегруженная функция исключительно для покупки NFT */
    function buy(uint256 id) public payable onlyNFT(id) {
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
    function buy(uint256 id, uint256 value) public payable onlyFT(id) {
        require(value <= token.balanceOf(address(this), id), "Have not funds!");
        require(_priceFT[id] > 0, "Cost isn't yet set!"); 
        require(msg.value == _priceFT[id] * value, "Incorrect msg.value!");

        uint256 _currentValue;
        uint256 newQueueHead;

        /* изменяем очередь, отправляем средства */
        for(uint256 i = queueHead; i < queueTail; i++) {
            _currentValue += valueInQueue[id][i];
            if (_currentValue >= value) {
                uint256 remainder = _currentValue - value; 
                uint256 valueForTransfer = valueInQueue[id][i] - remainder;

                valueInQueue[id][i] = remainder;

                /* средства к получению записываются в мэппинг до востребования */
                _toWithdraw[sellerInQueue[id][i]] += valueForTransfer * _priceFT[id];
                
                newQueueHead = i; 
                for(uint256 n = queueHead; n < newQueueHead; n++) {
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

        queueHead = newQueueHead; 
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

    function stopExhibitFT(uint256 id) public onlyFT(id) {
        /* логика удаления из очереди с возвратом тех токенов, которые не были
        проданы за время экспонирования. для того 
        ,чтобы забрать eth, полученный
        от продажи части токенов, нужно обратиться в отдельную функцию (withdrawETH) */
        /* в этой функции также нужно прописать удаление из мэппинга placeInQueue */
        uint256 placeInQueue = _placeInQueue[msg.sender];

        uint256 tokenValueForTransfer = valueInQueue[id][placeInQueue];
        address tokenOwner = sellerInQueue[id][placeInQueue];

        /* место в очереди как бы остается занятым, но value там уже не будет 
        иначе убрать из мэппинга в этой очереди никак */
        delete valueInQueue[id][placeInQueue];
        delete sellerInQueue[id][placeInQueue];

        /* выполняем перевод на адрес владельца токена */
        token.safeTransferFrom(address(this), tokenOwner, id, tokenValueForTransfer, "");

    }

    /* тут можно забрать только свой эфир, который получил от продажи FT или NFT */
    function withdrawETH() public {
        require(_toWithdraw[msg.sender] > 0, "You haven't value for withdraw!");

        (bool res,) = msg.sender.call{value: _toWithdraw[msg.sender]}("");
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
            require(exhibitedNFTOwners[ids[i]] == msg.sender, "You aren't token owner!");
        
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
            /* возможно всю логику отсюда нужно вынести в internal функцию */
            /* в этом цикле сделал так, чтобы нельзя было один FT добавить в массив 
            дважды */
            _joinExhibitedFT(id);

            _joinQueue(from, id, value);
            
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
                _joinExhibitedFT(ids[i]);
                _joinQueue(from, ids[i], values[i]);
            }
        }
        

        return this.onERC1155BatchReceived.selector;
    }

    function _joinQueue(address from, uint256 id, uint256 value) internal {
        /* подумать какие проверки нужно провести, прежде чем выполнить 
            запись в мэппинги */
            /* тут мы добавили эту заявку на продажу FT в конец очереди */
            require(value > 1, "Incorrect value");
            require(queueTail < queueTail - queueHead + type(uint256).max, "Queue is overflow!");
            valueInQueue[id][queueTail] = value;
            sellerInQueue[id][queueTail] = from;
            /* зафиксировали место в очереди для возможности удаления из
            очереди и просмотра своего места в очереди */
            _placeInQueue[from] = queueTail;
            
                /* все-таки оставим контроль переполняемости, тк. мы используем < queueTail
                в функции buy FT */
            queueTail++;
    }

    function _joinExhibitedFT(uint256 id) internal {
        for(uint256 i = 0; i < idsFTExhidited.length; i++) {
                if(idsFTExhidited[i] == id ) {
                    break;
                }

                if(idsFTExhidited[i] != id && i+1 == idsFTExhidited.length) {
                    idsFTExhidited.push(id);
                }
            }
    }

    function _joinExhibitedNFT(address from, uint256 id) internal {
        idsNFTExhidited.push(id);
            /* записываем владельца, чтобы перевести ему средства после продажи или 
            чтобы этот адрес мог вывести свой токен с продажи */
        exhibitedNFTOwners[id] = from; 
    }

    function _removeFromExhibit(uint256 id) internal returns(address) {
        address tokenOwner;

        for (uint256 i = 0; i < idsNFTExhidited.length; i++) {
            if (idsNFTExhidited[i] == id) { /* исправь везде опечатку idsNFTExhidited */
                idsNFTExhidited[i] = idsNFTExhidited[idsNFTExhidited.length];
                idsNFTExhidited.pop();
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
        require(false, "I dont receive!");
    }
}
