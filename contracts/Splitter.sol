pragma solidity 0.5.0;

contract Splitter {
    bool public paused = false;
    address payable public owner;
    mapping(address => uint) public funds;

    event Pause();
    event Resume();
    event Split(address indexed _splitter, address indexed _receiver1, address indexed _receiver2, uint256 _value);
    event Withdraw(address indexed _withdrawer, uint256 _value);

    modifier onlyowner {
        require(owner == msg.sender, "Only owner cann call given function!");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Can't perform operation while contract is paused!");
        _;
    }
    modifier whenPaused() {
        require(paused, "Can't perform operation while contract is in active state!");
        _;
    }

    constructor() public {
		owner = msg.sender;
	}

    function split(address receiver1, address receiver2) whenNotPaused public payable returns(bool) {
        require(msg.value > 0, "Function value can't be empty!");
        require(receiver1 != address(0) && receiver2 != address(0), "Receivers addresses cannot be empty!");

        uint256 amount = msg.value >> 1;

        funds[msg.sender] += msg.value % 2;// in case value is odd, the remainder is kept for the splitter
        funds[receiver1] += amount;
        funds[receiver2] += amount;

        emit Split(msg.sender, receiver1, receiver2, msg.value);
        
        return true;
    }

    function withdraw() whenNotPaused external returns(bool) {
        require(funds[msg.sender] > 0, "You don't have any funds!");

        uint fund = funds[msg.sender];
        funds[msg.sender] = 0;
        msg.sender.transfer(fund);

        emit Withdraw(msg.sender, fund);

        return true;
    }

    function pause() public onlyowner whenNotPaused returns(bool) {
        paused = true;
        emit Pause();
        
        return true;
    }

    function resume() public onlyowner whenPaused returns(bool) {
        paused = false;
        emit Resume();

        return true;
    }

    function kill() public onlyowner returns(bool) {
        selfdestruct(owner);
        return true;
    }
}