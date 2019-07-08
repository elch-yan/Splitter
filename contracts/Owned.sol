pragma solidity 0.5.5;

contract Owned {
    address payable private owner;

    event LogChangeOwner(address _originalOwner, address _newOwner);

    modifier onlyowner {
        require(owner == msg.sender, "Only owner cann call given function!");
        _;
    }

    constructor() public {
		owner = msg.sender;
	}

    function changeOwner(address payable newOwner) public onlyowner returns(bool) {
        require(newOwner != address(0), "New owners address cannot be empty!");
        
        owner = newOwner;
        emit LogChangeOwner(msg.sender, newOwner);

        return true;
    }

    function getOwner() public view returns(address payable) {
        return owner;
    }
}