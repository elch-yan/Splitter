pragma solidity 0.5.5;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Stoppable.sol";

contract Splitter is Stoppable {
    using SafeMath for uint256;

    mapping(address => uint) public funds;

    event LogSplit(address indexed splitter, address indexed receiver1, address indexed receiver2, uint256 value);
    event LogWithdraw(address indexed withdrawer, uint256 value);

    function split(address receiver1, address receiver2) public payable whenNotPaused returns(bool) {
        require(msg.value > 0, "Function value can't be empty!");
        require(receiver1 != address(0) && receiver2 != address(0), "Receivers addresses cannot be empty!");

        uint256 amount = msg.value.div(2);

        funds[msg.sender] = funds[msg.sender].add(msg.value.mod(2));// in case value is odd, the remainder is kept for the splitter
        funds[receiver1] = funds[receiver1].add(amount);
        funds[receiver2] = funds[receiver2].add(amount);

        emit LogSplit(msg.sender, receiver1, receiver2, msg.value);
        
        return true;
    }

    function withdraw() external whenNotPaused returns(bool) {
        require(funds[msg.sender] > 0, "You don't have any funds!");

        uint fund = funds[msg.sender];
        funds[msg.sender] = 0;

        emit LogWithdraw(msg.sender, fund);
        msg.sender.transfer(fund);

        return true;
    }
}