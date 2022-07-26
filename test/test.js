const { ethers } = require("hardhat");
const hre = require("hardhat");
const { GoblinSaxAPI } = require("@goblinsax/gs-sdk");
const { expect } = require("chai");

let WETH;
let gs;
let owner;
let NFT_CONTRACT;
let NFT = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";

describe('API Tests', function () {

    before(async function () {
        let erc721ABI = [{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]
        WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
        [owner] = await ethers.getSigners();

        gs = new GoblinSaxAPI(owner, process.env.GS_MAINNET_API, 'MAINNET')
        
        //Transfer ETH and BAYC to run the test

        let WHALE = "0x8AD272Ac86c6C88683d9a60eb8ED57E6C304bB0C"

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WHALE],
        });

        const nft_signer = await ethers.provider.getSigner(WHALE);
        let AMT = ethers.utils.parseEther("0.1")

        let eth_balance = await owner.provider.getBalance(WETH);

        if (AMT >= eth_balance ){
            await nft_signer.sendTransaction({
                to: owner.address,
                value: AMT
            });

            console.log("Transferred ETH")
        }

        NFT_CONTRACT = await ethers.getContractAt(erc721ABI, NFT, nft_signer);

        // await NFT_CONTRACT.transferFrom(WHALE, owner.address, 7090, {
        //     from: WHALE,
        // })

        console.log("Transferred BAYC")
    });

    it("Enough gas to take loans", async function() {
        let eth_balance = await owner.provider.getBalance(owner.address);
        expect(eth_balance / 10**18 ).to.greaterThan(0.01)
    })

    it("Account has BAYC", async function() {
        let balance = await NFT_CONTRACT.balanceOf(owner.address)
        expect(balance.toNumber()).to.greaterThanOrEqual(1)
    })


    it("Create and repay loan", async function() {
        let terms = await gs.getTerms(NFT, 7090)

        if (await gs.checkApprovedNFT(NFT) == false){
            await gs.approveSpendingNFT(NFT)
        }

        duration = 7
        let sel = terms['offers'][String(duration)][0]
        let loan = await gs.beginLoan(NFT, 7090, duration, owner.address, terms['price'] * 10**18 * sel['LTV'], sel['APR'], "0x0000000000000000000000000000000000000000")

        if (await gs.checkApprovedWETH() == false){
            await gs.approveSpendingWETH()
        }

        let allLoans = await gs.getLoans(process.env.ALCHEMY_API)
        let loanIds = Object.keys(allLoans)

        await gs.repayLoan(loanIds[0])
    })

})