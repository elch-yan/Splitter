const Splitter = artifacts.require("Splitter");

contract('Splitter', accounts => {
    let splitterInstance, sender, receiver1, receiver2;
    before(async () => {
        // Setup accounts
        sender = accounts[0];
        receiver1 = accounts[1];
        receiver2 = accounts[2];

        splitterInstance = await Splitter.deployed();
    });

    it('Should split even amount of ether correctly', async () => {
      // Split sent ether between receivers.
      const amount = 10;
      assert(await splitterInstance.split(receiver1, receiver2, { from: sender, value: amount }), 'Split operation failed');

      // Get funds for receivers accounts after split
      const receiver1Funds = await splitterInstance.funds.call(receiver1);
      const receiver2Funds = await splitterInstance.funds.call(receiver2);

      // Checking if everything is as expected
      assert.equal(receiver1Funds, amount >> 1, 'Value was split incorrectly');
      assert.equal(receiver2Funds, amount >> 1, 'Value was split incorrectly');

      assert(await splitterInstance.withdraw({ from: receiver1 }), 'Withdrawal failed');
      assert(await splitterInstance.withdraw({ from: receiver2 }), 'Withdrawal failed');
    });

    it('Should split odd number of ether correctly', async () => {
      // Split sent ether between receivers.
      const amount = 11;
      await splitterInstance.split(receiver1, receiver2, { from: sender, value: amount });
  
      // Get funds for receivers and senders accounts after split
      const senderFunds = await splitterInstance.funds.call(sender);
      const receiver1Funds = await splitterInstance.funds.call(receiver1);
      const receiver2Funds = await splitterInstance.funds.call(receiver2);
  
      // Checking if everything is as expected
      assert.equal(senderFunds, 1, 'Value was split incorrectly');
      assert.equal(receiver1Funds, amount >> 1, 'Value was split incorrectly');
      assert.equal(receiver2Funds, amount >> 1, 'Value was split incorrectly');

      assert(await splitterInstance.withdraw({ from: sender }), 'Withdrawal failed');
      assert(await splitterInstance.withdraw({ from: receiver1 }), 'Withdrawal failed');
      assert(await splitterInstance.withdraw({ from: receiver2 }), 'Withdrawal failed');
    });
});