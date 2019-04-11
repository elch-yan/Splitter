const Splitter = artifacts.require("Splitter");

contract('Splitter', accounts => {
    it('should split ether correctly', async () => {
        const splitterInstance = await Splitter.deployed();
    
        // Setup 3 accounts
        const sender = accounts[0];
        const receiver1 = accounts[1];
        const receiver2 = accounts[2];
    
        // Get initial balances of the receiver accounts
        const receiver1InitialBalance = await web3.eth.getBalance(receiver1);
        const receiver2InitialBalance = await web3.eth.getBalance(receiver2);
    
        // Split sent ether between receivers.
        const amount = 10;
        await splitterInstance.split(receiver1, receiver2, { from: sender, value: amount });
    
        // Get balances of receiver account after split
        const receiver1EndingBalance = await web3.eth.getBalance(receiver1);
        const receiver2EndingBalance = await web3.eth.getBalance(receiver2);
    
        // Checking if everything is as expected
        assert.equal(receiver1EndingBalance, web3.utils.toBN((receiver1InitialBalance)).add(web3.utils.toBN(amount / 2)).toString(), "Amount was split incorrectly");
        assert.equal(receiver2EndingBalance, web3.utils.toBN((receiver2InitialBalance)).add(web3.utils.toBN(amount / 2)).toString(), "Amount was split incorrectly");
      });
});