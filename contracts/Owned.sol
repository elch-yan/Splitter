pragma solidity 0.5.0;

contract Owned {
    address payable public owner;

    event ChangeOwner(address _originalOwner, address _newOwner);

    modifier onlyowner {
        require(owner == msg.sender, "Only owner cann call given function!");
        _;
    }

    constructor() public {
		owner = msg.sender;
	}

    function changeOwner(address payable newOwner) public onlyowner returns(bool) {
        owner = newOwner;
        emit ChangeOwner(msg.sender, newOwner);

        return true;
    }
}