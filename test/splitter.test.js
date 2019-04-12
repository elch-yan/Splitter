const chai = require('chai');
chai.use(require('chai-as-promised')).should();

const Splitter = artifacts.require("Splitter");

contract('Splitter', accounts => {
    // Setup accounts
    const owner = accounts[0];
    const sender = accounts[1];
    const receiver1 = accounts[2];
    const receiver2 = accounts[3];
    
    let splitterInstance;
    
    beforeEach(async () => {
        splitterInstance = await Splitter.new();
    });

    describe('Splitting functionality', () => {
      it('Should split even amount of ether correctly', async () => {
        // Split sent ether between receivers.
        const amount = 10;
        const txObject = await splitterInstance.split(receiver1, receiver2, { from: sender, value: amount });
        assert(txObject.receipt.status, 'Split operation failed');
  
        // Checking if everything as expected
        await checkFunds(receiver1, amount >> 1);
        await checkFunds(receiver2, amount >> 1);
      });
  
      it('Should split odd number of ether correctly', async () => {
        // Split sent ether between receivers.
        const amount = 11;
        const txObject = await splitterInstance.split(receiver1, receiver2, { from: sender, value: amount });
        assert(txObject.receipt.status, 'Split operation failed');
        
        // Checking if everything as expected
        await checkFunds(sender, 1);
        await checkFunds(receiver1, amount >> 1);
        await checkFunds(receiver2, amount >> 1);
      });
  
      /**
       * Checks funds for an account, withdraws them and checks if everything is as expected
       *
       * @param {String} account Account address
       * @param {Number} expectedAmount Withdrawal amount to be expected
       */
      async function checkFunds(account, expectedAmount) {
        // Get account initial balance
        const initialBalance = web3.utils.toBN(await web3.eth.getBalance(account));
  
        // Withdraw funds and get transaction cost
        const txObject = await splitterInstance.withdraw({ from: account });
        assert(txObject.receipt.status, `Withdrawal for an account: ${account} failed`);
        const txPrice = await getTransactionPrice(txObject);
  
        // Get account final balance
        const finalBalance = web3.utils.toBN(await web3.eth.getBalance(account));
  
        // Check final balance
        assert.equal(finalBalance.add(txPrice).sub(initialBalance).toString(), expectedAmount.toString(), `Final balance for an account: ${account} is incorrect`);
      }
  
      /**
       * Retrieves price for making a transaction
       *
       * @param {Object} txObject
       * @returns {BN} price
       */
      async function getTransactionPrice(txObject) {
        // Obtain used gas from the receipt
        const gasUsed = web3.utils.toBN(txObject.receipt.gasUsed);
        
        // Obtain gasPrice from the transaction
        const tx = await web3.eth.getTransaction(txObject.tx);
        const gasPrice = web3.utils.toBN(tx.gasPrice);
        
        // Calculate overall price
        return gasPrice.mul(gasUsed);
      }
    });

    describe('Pausing, resuming and self destructing functionality', () => {
      it('Only owner should be able to pause or resume contract', async () => {
        await splitterInstance.pause({from: sender}).should.be.rejectedWith(Error);

        let txObject = await splitterInstance.pause({from: owner});
        assert(txObject.receipt.status, `Pausing failed for the owner`);

        await splitterInstance.resume({from: sender}).should.be.rejectedWith(Error);

        txObject = await splitterInstance.resume({from: owner});
        assert(txObject.receipt.status, `Resuming failed for the owner`);
      });

      it('Should be able to split only when contract is not paused', async () => {
        // Pausing
        await splitterInstance.pause({from: owner});
        
        // Splitting
        await splitterInstance.split(receiver1, receiver2, { from: sender, value: 100 }).should.be.rejectedWith(Error);
        
        // Resuming
        await splitterInstance.resume({from: owner});

        // Splitting
        txObject = await splitterInstance.split(receiver1, receiver2, { from: sender, value: 100 });
        assert(txObject.receipt.status, 'Split operation failed when contract was resumed');
      });

      it('Should be able to withdraw only when contract is not paused', async () => {
        // Splitting
        await splitterInstance.split(receiver1, receiver2, { from: sender, value: 100 });
        
        // Pausing
        await splitterInstance.pause({from: owner});

        // Withdrawing
        await splitterInstance.withdraw({from: receiver1}).should.be.rejectedWith(Error);

        // Resuming
        await splitterInstance.resume({from: owner});

        // Withdrawing
        txObject = await splitterInstance.withdraw({from: receiver1});
        assert(txObject.receipt.status, 'Withdrawal failed when contract was resumed');
      });

      it('Only owner can kill the contract', async () => {
        await splitterInstance.kill({from: receiver1}).should.be.rejectedWith(Error);

        assert.equal(await splitterInstance.getOwner(), owner, 'Contract was not deleted');
        
        await splitterInstance.kill({from: owner});
        await splitterInstance.getOwner().should.be.rejectedWith(Error);
      });
    });
});