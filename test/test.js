const { ethers } = require("hardhat");
const hre = require("hardhat");
// const { GoblinSaxAPI } = require("@goblinsax/gs-sdk");

describe('API Tests', function () {

    before(async function () {
        const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WETH],
        });
    
        [owner] = await ethers.getSigners();
    
    
    
        //Transfer weth and ETH to run tests
        const weth_signer = await ethers.provider.getSigner(WETH);
    
        await weth_signer.sendTransaction({
            to: owner.address,
            value: ethers.utils.parseEther("2000")
        });
    });

    it("Enough Balance to take loans", async function() {
    
    
    
    })


})