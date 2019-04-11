pragma solidity 0.5.0;

contract Splitter {
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() public { }

    function split(address payable receiver1, address payable receiver2) public payable {
        uint256 amount = msg.value >> 1;

        receiver1.transfer(amount);
        emit Transfer(msg.sender, receiver1, amount);
        receiver2.transfer(amount);
        emit Transfer(msg.sender, receiver2, amount);
    }
}