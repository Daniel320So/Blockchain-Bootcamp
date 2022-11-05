// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {

    address public feeAccount;
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public userBalance;
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCanceled;
    mapping(uint256 => bool) public orderFilled;

    //Order Mapping; 
    struct _Order {
        uint256 id; //Unique identifier
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timeStamp; //When order was created
    }

    event DepositToken(address indexed _token, address indexed _user, uint256 _amount, uint256 _balance);
    event WithdrawToken(address indexed _token, address indexed _user, uint256 _amount, uint256 _balance);
    event NewOrder(
        uint256 _id,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive,
        uint256 _timestamp
    );
    event CancelOrder(
        uint256 _id,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive,
        uint256 _timestamp
    );

    event Trade(
        uint256 _id,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive,
        address _creator,
        uint256 _timestamp
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Deposit Tokens
    function depositToken(address _token, uint256 _amount) public {
        
        //Transfer Token to Exchnage
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        //Update user balance
        userBalance[_token][msg.sender] = userBalance[_token][msg.sender] + _amount;
        //Emit an event
        emit DepositToken(_token, msg.sender, _amount, userBalance[_token][msg.sender]);
    }

    //Withdraw Tokens
    function withdrawToken(address _token, uint256 _amount) public {
        require( userBalance[_token][msg.sender] >= _amount, "Insufficient Balnace");
        userBalance[_token][msg.sender] = userBalance[_token][msg.sender] - _amount;
        Token(_token).transfer( msg.sender, _amount);
        emit WithdrawToken(_token, msg.sender, _amount, userBalance[_token][msg.sender]);
    }

    function balanceOf(address _token) public view returns (uint256) {
        return userBalance[_token][msg.sender];
    }

    // --------------------
    // Make & Ccancle Order

    // Token Give (the token they want to spend) - which token, and how much?
    // Token Get (the token they want to receive) - which token, and how much?
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        require( balanceOf(_tokenGive) >= _amountGive,"Insufficient Balance");
        orderCount++;
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
        emit NewOrder(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(msg.sender == _order.user, "Invalid user");
        require(_id == _order.id, "order not exist");
        orderCanceled[_id] = true;
        emit CancelOrder(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp
        );
    }

    //Executing Orders

    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount, "Order not exits");
        require(!orderCanceled[_id], "Order Canceled");
        require(!orderFilled[_id], "Order Filled");
        _Order storage _order = orders[_id];
        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );
        orderFilled[_order.id] = true;
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive) internal {

        uint256 _feeAmount = (_amountGet * feePercent) / 100;
        require( userBalance[_tokenGet][msg.sender] >= _amountGive + _feeAmount ,"Insufficient Balance");

        userBalance[_tokenGet][msg.sender] =  userBalance[_tokenGet][msg.sender] - _amountGet - _feeAmount;
        userBalance[_tokenGet][_user] = userBalance[_tokenGet][_user] + _amountGet;

        userBalance[_tokenGet][feeAccount] = userBalance[_tokenGet][feeAccount] + _feeAmount;

        userBalance[_tokenGive][msg.sender] =  userBalance[_tokenGive][msg.sender] + _amountGive;
        userBalance[_tokenGive][_user] = userBalance[_tokenGive][_user] - _amountGive;

        emit Trade(
            _orderId,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );
    }
}