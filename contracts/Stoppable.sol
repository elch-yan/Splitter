pragma solidity 0.5.0;

import "./Owned.sol";

contract Stoppable is Owned {
    bool public paused = false;

    event Pause();
    event Resume();

    modifier whenNotPaused() {
        require(!paused, "Can't perform operation while contract is paused!");
        _;
    }

    modifier whenPaused() {
        require(paused, "Can't perform operation while contract is in active state!");
        _;
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