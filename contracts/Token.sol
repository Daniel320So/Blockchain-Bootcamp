// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance; //Owner --> Spender

    event Transfer(address indexed _from, address indexed _to, uint256 _value); //indexed help filter event
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(balanceOf[_from] >= _value, "insufficient balance");
        require(_to != address(0), "invalid address");
        balanceOf[_from] = balanceOf[_from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        emit Transfer(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "invalid address");
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(allowance[_from][msg.sender] >= _value, "insufficient allowance");
        _transfer(_from, _to, _value);
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
