pragma solidity 0.5.5;

import "./Owned.sol";

contract Stoppable is Owned {
    bool private paused = false;

    event LogPause();
    event LogResume();

    modifier whenNotPaused() {
        require(!paused, "Can't perform operation while contract is paused!");
        _;
    }

    modifier whenPaused() {
        require(paused, "Can't perform operation while contract is in active state!");
        _;
    }

    function isPaused() public view returns(bool) {
        return paused;
    }

    function pause() public onlyowner whenNotPaused returns(bool) {
        paused = true;
        emit LogPause();
        
        return true;
    }

    function resume() public onlyowner whenPaused returns(bool) {
        paused = false;
        emit LogResume();

        return true;
    }

    function kill() public onlyowner returns(bool) {
        selfdestruct(getOwner());
        return true;
    }
}