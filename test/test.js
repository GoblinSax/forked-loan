const { ethers } = require("hardhat");
const hre = require("hardhat");
const { GoblinSaxAPI } = require("@goblinsax/gs-sdk");
const { expect } = require("chai");

let WETH;
let gs;
let owner;
let NFT_CONTRACT;
let WETH_CONTRACT;
let NFT = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";

describe('API Tests', function () {

    before(async function () {
        let erc721ABI = [{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]
        let erc20ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]
        
        WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
        [owner] = await ethers.getSigners();

        gs = new GoblinSaxAPI(owner, process.env.GS_MAINNET_API, 'MAINNET')
        
        //Transfer ETH to pay gas and BAYC to run the test

        let WHALE = "0x8AD272Ac86c6C88683d9a60eb8ED57E6C304bB0C"

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WHALE],
        });

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WETH],
        });

        const nft_signer = await ethers.provider.getSigner(WHALE);
        const weth_signer = await ethers.provider.getSigner(WETH);

        await nft_signer.sendTransaction({
            to: owner.address,
            value: ethers.utils.parseEther("1")
        });

        console.log("Transferred ETH to pay Gas")

        WETH_CONTRACT = await ethers.getContractAt(erc20ABI, WETH, weth_signer);
        await WETH_CONTRACT.transfer("0xb66284947F9A35bD9FA893D444F19033FeBdA4A1", ethers.utils.parseEther("500"), {
            from: WETH,
        });

        console.log("Transferred WETH to GS Contract")


        NFT_CONTRACT = await ethers.getContractAt(erc721ABI, NFT, nft_signer);

        await NFT_CONTRACT.transferFrom(WHALE, owner.address, 7090, {
            from: WHALE,
        })



        console.log("Transferred BAYC to test account")
    });

    it("Enough gas to take loans", async function() {
        let eth_balance = await owner.provider.getBalance(owner.address);
        expect(eth_balance / 10**18 ).to.greaterThan(0.1)
    })

    it("Account has BAYC", async function() {
        let balance = await NFT_CONTRACT.balanceOf(owner.address)
        expect(balance.toNumber()).to.greaterThanOrEqual(1)
    })


    it("Create loan", async function() {
        let terms = await gs.getTerms(NFT, 7090)

        if (await gs.checkApprovedNFT(NFT) == false){
            await gs.approveSpendingNFT(NFT)
            console.log(await gs.checkApprovedNFT(NFT))
        }

        duration = 7
        let sel = terms['offers'][String(duration)][0]

        console.log(sel)

        let loan = await gs.beginLoan(NFT, 7090, duration, owner.address, BigInt(sel['loanPrincipal']), sel['APR'], "0x0000000000000000000000000000000000000000")
        console.log("Created loan")
    })
})