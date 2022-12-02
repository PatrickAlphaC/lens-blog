**ApeWorX: The New Python Framework on the Block**


#### **Python developers love working with the smart contract framework Brownie. A successor to Brownie is in the making—creating a reimagination of the Python Web3 developer experience. **

In this piece, I’ll be talking about [ApeWorX](https://www.apeworx.io/), also known as “Ape”.

ApeWorX is a Python-based smart contract development and deployment framework known for its customizability and safe private key management.

Many of you know that I love Python, and upon entering the Web3 space I fell in love with the[ Brownie](https://github.com/eth-brownie/brownie) framework. Since I entered the space it seems as if all the original Web3 frameworks have either been succeeded or another competitor has swooped in:

* [DappTools officially recognized Foundry](https://github.com/dapphub/dapptools/pull/927/files) as its successor.
* [Hardhat](https://hardhat.org/) took the spot of the most-used framework in DeFi after a long tenure from[ Truffle](https://trufflesuite.com/)<span style="text-decoration:underline;">.</span>
* [ApeWorX](https://www.apeworx.io/) seems to be positioned to one day be the successor to the Brownie framework.

The Ethereum Python community is known for being one of the most collaborative and tight-knit groups out there. Many of the[ Vyper](https://vyper.readthedocs.io/en/stable/index.html) and[ Brownie contributors](https://github.com/eth-brownie/brownie/graphs/contributors) can be seen on the list of[ Ape contributors](https://github.com/ApeWorX/ape/graphs/contributors), including[ Doggie B](https://github.com/fubuloubu),[ Banteg](https://twitter.com/bantg), and[ Skellet0r](https://github.com/skellet0r) (and to a lesser extent, even myself!) 

Additionally, both Python enthusiasts and DeFi protocols[ like Curve](https://curve.fi/) have started[ using Ape](https://github.com/curvefi/metaregistry) as a framework for their contracts.

Today we are going to take a high-level “lickity-split” look at coming at ApeWorX from a Brownie user’s perspective. 


### **Lickity-Split**

_You can find a minimal ApeWorX & Vyper template in our[ ApeWorX-starter-kit](https://github.com/smartcontractkit/apeworx-starter-kit) with code examples to get you started. _

After[ installing ape](https://docs.apeworx.io/ape/stable/userguides/quickstart.html#installation) with something like pipx install eth-ape or pip, you’ll have access to the ape command-line interface.

The quickest way to start a new project is to use ape init, which will give you a blank setup that will look as such:

```
.
├── ape-config.yaml
├── contracts
├── scripts
└── tests
```

Here’s what each folder contains:

* **Contracts: **Where all your Vyper, Solidity, or other contracts will go.
* **Scripts: **Where all your Python code will go.
* **Tests: **Your Python tests. 
* **ape-config.yaml: **The config file for your project. This is the ape equivalent of brownie-config.yaml or hardhat.config.js. 

In your scripts folder, you can make a script like:

```python
def main():

 print("Hello!")
```

To run any of your Python scripts in ape, run:

```python
ape run scripts/my_script.py
```

#### **Plugins**

Ape doesn’t have Vyper, Solidity, or really anything by default, and instead uses a[ system of plugins](https://docs.apeworx.io/ape/stable/userguides/installing_plugins.html) to make ApeWorX completely customizable to your specific smart contract needs. Two of the most popular plugins are those for[ Solidity](https://github.com/ApeWorX/ape-solidity) and[ Alchemy](https://github.com/ApeWorX/ape-alchemy), which allow you to compile Solidity contracts and easily deploy to Alchemy. 

ape plugins install solidity alchemy

Once you have this set up, you can write your Solidity contract in the contracts folder and compile. 

ape compile


#### **Networks**

Ape takes a specific approach to working with networks. Most frameworks, including Hardhat, Brownie, and Foundry, treat EVM chains in a similar fashion. ApeWorX is different. 

ApeWorX separates networks into **ecosystems **and **chains**. For example, the Ethereum ecosystem is separated into **mainnet, ropsten, kovan, goerli, **etc. If you want to work with something like Fantom, you can install the fantom network plugin:

ape plugins install fantom

Then you’ll see your new list of networks on the ape networks list:  

```
fantom                                                                                                      
├── opera                                                                                                   
│   └── geth  (default)                                                                                     
├── testnet                                                                                                 
│   └── geth  (default)                                                                                     
└── local  (default)                                                                                        
   └── test  (default)
```

In cases where you don’t want to have to install a plugin for your network, you can use the[ ad-hoc method](https://docs.apeworx.io/ape/stable/userguides/networks.html#ad-hoc-network-connection) and just drop the RPC URL to the network you like. ape will assume as much as it can for sending transactions. 

ape run scripts/my_script.py --network https://my_rpc_url.com


#### **Accounts**

One of the biggest differences across frameworks is how they deal with accounts. Most frameworks have you setup a .env file to store your private keys in. However, putting your private keys in a .env has been[ tripping up developers forever](https://twitter.com/heyOnuoha/status/1522542744954191872). You _can _do this in ape, but the default is much safer. 

Ape allows you to import private keys, then it will encrypt and store them on your computer. Whenever you want to work with that account or private key, you’ll need the password to decrypt it. This means no more accidentally pushing your keys up to GitHub!

ape accounts import my_key

It will then prompt you for your key and your password. In your Python scripts, you can then get your private key using the load function.

from ape import accounts

accounts.load("local-default")

When you run this script, you’ll be prompted for your password. 


#### **The Rest…**

The rest of the framework works as you’d expect. You can write your tests using[ pytest](https://docs.pytest.org/en/7.1.x/), one of the most popular Python testing frameworks. You can enter the[ ape console](https://docs.apeworx.io/ape/stable/commands/console.html) to work with an interactive shell in a Python environment with your network of choice. 

It’s everything you’d want and expect from a framework. 

Ape is a new player in the framework space, and it’s a[ wonderful repo to contribute to.](https://github.com/ApeWorX/ape/issues) If you love Python and have an idea on how to improve ape, be sure to leave an issue, a pull request, or just drop them a star!

Happy Ape-ing!
