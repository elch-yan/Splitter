const Web3 = require('web3');
const $ = require('jquery');
const assert = require('assert');

require('file-loader?name=../index.html!../index.html');

const truffleContract = require('truffle-contract');
const splitterJson = require('../../build/contracts/Splitter.json');

if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    web3 = new Web3(web3.currentProvider);
} else {
    // Fallback.
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

const Splitter = truffleContract(splitterJson);
Splitter.setProvider(web3.currentProvider);

let account;

async function split() {
    try {
        const receiver1 = $('input[name="receiver1"]').val();
        const receiver2 = $('input[name="receiver2"]').val();
        const value = $('input[name="amount"]').val()
        const gas = 300000;
        const splitter = await Splitter.deployed();

        // checking if transaction will succeed
        assert(await splitter.split.call(
            receiver1,
            receiver2,
            { from: account, value, gas }
        ), 'The transaction will fail anyway, not sending');

        const txObj = await splitter.split(
            receiver1,
            receiver2,
            { from: account, value, gas }
        ).on(
            'transactionHash',
            txHash => $('#status').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('got receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong status');
            console.error(receipt);
            $('#status').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#status').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#status').html('Transfer executed');
        }

        const balance = web3.utils.fromWei(await web3.eth.getBalance(account), 'ether');

        $('#balance').html(balance.toString(10));
    } catch (err) {
        $('#status').html(err.toString());
        console.error(err);
    }
}

window.addEventListener('load', async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        if (!accounts.length) {
            $('#balance').html('N/A');
            throw new Error('No account with which to transact');
        }

        account = accounts[0];
        console.log('Account:', account);

        const network = await web3.eth.net.getId();
        console.log('Network:', network.toString(10));

        const balance = web3.utils.fromWei(await web3.eth.getBalance(account), 'ether');

        $('#balance').html(balance.toString(10));

        $("#split").click(split);
    } catch (err) {
        console.error(err);
    }
});