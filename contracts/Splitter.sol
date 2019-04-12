pragma solidity 0.5.0;

import "./Stoppable.sol";

contract Splitter is Stoppable {
    mapping(address => uint) public funds;

    event Split(address indexed _splitter, address indexed _receiver1, address indexed _receiver2, uint256 _value);
    event Withdraw(address indexed _withdrawer, uint256 _value);

    function split(address receiver1, address receiver2) public payable whenNotPaused returns(bool) {
        require(msg.value > 0, "Function value can't be empty!");
        require(receiver1 != address(0) && receiver2 != address(0), "Receivers addresses cannot be empty!");

        uint256 amount = msg.value >> 1;

        funds[msg.sender] += msg.value % 2;// in case value is odd, the remainder is kept for the splitter
        funds[receiver1] += amount;
        funds[receiver2] += amount;

        emit Split(msg.sender, receiver1, receiver2, msg.value);
        
        return true;
    }

    function withdraw() external whenNotPaused returns(bool) {
        require(funds[msg.sender] > 0, "You don't have any funds!");

        uint fund = funds[msg.sender];
        funds[msg.sender] = 0;
        msg.sender.transfer(fund);

        emit Withdraw(msg.sender, fund);

        return true;
    }
}