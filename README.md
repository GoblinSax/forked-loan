1) Copy .env-example and make .env

2) Build the latest pull of <a href="https://github.com/GoblinSax/gs-sdk">gs-sdk</a> using:
> npm run build

3) Link it using:
> npm link

4) Now on forked-loan repo:
> npm link @goblinsax/gs-sdk


5) Start a hardhat node using:
> npx hardhat node

6) Run the tests using:
> npx hardhat test --network localhost