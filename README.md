Build the <a href="https://github.com/GoblinSax/gs-sdk">gs-sdk</a> using:
> npm run build:cjs

Go to packages/cjs and:
> npm link

No on forked-loan repo:
> npm link @goblinsax/gs-sdk

Start a hardhat node using:
> npx hardhat node


Run the tests using:
> npx hardhat test --network localhost