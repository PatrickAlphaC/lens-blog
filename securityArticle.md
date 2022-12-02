_Special thanks to [Adrian Hetman](https://twitter.com/adrianhetman), [Alejandro Munoz-McDonald](https://twitter.com/unsafe_call), [Ivan Benavides](https://twitter.com/Ivanbenavides_), and [Leon Spacewalker](https://twitter.com/leonspacewalker)._

[https://www.youtube.com/watch?v=sgHHbWvWj9A](https://www.youtube.com/watch?v=sgHHbWvWj9A)


# Top 7 Strategies for Finding Smart Contract Vulnerabilities

Hunting for smart contract bugs can be a ludicrously well-paying job, and it’s also an integral part of protecting the ecosystem from hacks. I recently had the pleasure of [interviewing a developer](https://twitter.com/leonspacewalker) who found a $7 billion dollar bug—and [was paid $2.2M](https://medium.com/immunefi/polygon-lack-of-balance-check-bugfix-postmortem-2-2m-bounty-64ec66c24c7d) for reporting it. 

In this blog, we’re going to go through the bug that this developer found and how it had the potential to compromise $7b in value before offering some strategies and tools that will help you find bugs.

Let's dive in.


# What Happened


## Build Up

On May 31, 2020, the [Matic blockchain went live](https://crypto.news/matic-network-mainnet-live/) (Matic would later be rebranded as [Polygon](https://polygon.technology/)). Polygon is an EVM-compatible blockchain known for it's low gas fees and short block time. The chain has recently begun exploring [zk-rollup technology](https://www.alchemy.com/overviews/polygon-zk-rollups). 

If you take a look at [block 0](https://polygonscan.com/block/0) of Polygon, the absolute first block of the blockchain, also known as its “genesis” block, you'll see 10 transactions. One of these transactions created a contract called MRC20.

What is this contract?

When we send a native blockchain token we have to spend gas to do so. So the Polygon team deployed a contract that allows you to sign a transaction to send someone ETH, with someone else able to pay the gas fee for this transaction. Known as a "meta transaction," this capability was popularized with the introduction of [EIP-712](https://eips.ethereum.org/EIPS/eip-712).

You can see that this contract was given almost 10 billion MATIC tokens in order to help facilitate these gasless transactions. However, this clever contract contained a vulnerability that could have potentially been exploited to drain the entire balance!

On December 3rd, 2021 the hero of the story, pseudo-anon developer [Leon Spacewalker](https://twitter.com/leonspacewalker), submitted a report to the [Immunefi bug bounty](https://immunefi.com/bounty/immunefi/) program laying out the details of this exact function. A second hero, who we will just call Whitehat2, also reported the vulnerability a day later. 

Around 800,000 MATIC tokens were stolen before the chain was finally forked, rolled back, and fixed [December 5th, 2021.](https://github.com/maticnetwork/bor/releases/tag/v0.2.12)

This leaves us with some more questions: What was the vulnerability? How did it stay undiscovered for so long? How was it found?


## The Exploit

Below is the function that facilitates these gasless transactions.


```javascript
   function transferWithSig(
       bytes calldata sig,
       uint256 amount,
       bytes32 data,
       uint256 expiration,
       address to
   ) external returns (address from) {
       require(amount > 0);
       require(
           expiration == 0 || block.number <= expiration,
           "Signature is expired"
       );

       bytes32 dataHash = getTokenTransferOrderHash(
           msg.sender,
           amount,
           data,
           expiration
       );
       require(disabledHashes[dataHash] == false, "Sig deactivated");
       disabledHashes[dataHash] = true;

       from = ecrecovery(dataHash, sig);

       _transferFrom(from, address(uint160(to)), amount);
   }
```


At first glance, it seems harmless: It takes the signature of the user, how many tokens and who they want to send them to, and any further data, along with an expiration date for the transaction.

It runs some requires, gets the data hash in order to send the meta transaction, makes sure the data hash hasn't been used, and does this `ecrecovery` function. 

This function is essentially a wrapper for the [Solidity ecrecover function](https://docs.soliditylang.org/en/latest/cheatsheet.html?highlight=ecrecover#global-variables).


This function is how we can verify where signed transactions are coming from. You’ll notice, even in the Solidity documentation, it says it will “return zero on error”. The `ecrecovery` function copied this, and if it had an issue, it would return 0. Which, as many developers know, can be scary. If it returns zero on error, that means that we should check to make sure that the returned address isn’t zero, right? 

Well... We that's not what happened. 

So we don’t perform a check on the address to make sure it didn’t result in an error. Not a problem. The last line of code in our `transferWithSig` function does the actual transfer, surely we will perform some sort of check there, right? 


```javascript
function _transfer(address sender, address recipient, uint256 amount)
   internal
{
   require(recipient != address(this), "can't send to MRC20");
   address(uint160(recipient)).transfer(amount); // It just sends the money!
   emit Transfer(sender, recipient, amount);
}
```


The `_transferFrom` function just called our `_transfer` function, shown above. You'll notice it doesn't check to make sure the `from` address has enough money. 

This means that someone could send an invalid signature, which would result in a zero address returned from ecrecovery, but the MRC20 contract would still send the `to` address an amount of money. This is how that 9,999,993,000 MATIC could be drained, since the MRC20 contract sends the money directly from itself! 

A check to make sure that the `from` address has enough money for this signed transaction would have prevented this issue.


## How Did the Vulnerability Elude Discovery  for So Long? 

What's odd to me is that, after the vulnerability laying dormant for almost a year and a half, it was discovered by Leon, another white hat, and a hacker within the span of a few days. 

Seems fishy. But the Immunefi team told me this can often happen. Some exploits can become popular based on an article, write-up, or [challenge](https://github.com/code-423n4/2021-09-swivel-findings/issues/61) and people then start looking for that vulnerability, resulting in several people finding it at the same time. 

But more likely is that it turns out that polygon verified the contract on Polygonscan around this time - so that was when people _really _started to look at it. 

Maybe there is more to the story, but maybe not. 

In any case, let’s use this bug as a teachable moment and look at some of the skills Leon and other bug hunters use to find bugs, helping protect the Web3 ecosystem.


# Top 7 Strategies

Now, we are going to learn the skills Leon and other bug hunters use to find these vulnerabilities and claim bug bounties. This list of tips assumes you already know the basics of smart contracts, so yes, [learning Solidity is a prerequisite](https://www.youtube.com/watch?v=gyMwXuJrbJQ&t=23615s). 

Use these superpowers for [ethical hacking](https://www.eccouncil.org/ethical-hacking/), and please remember to [responsibly disclose](https://www.hackerone.com/vulnerability-management/what-responsible-disclosure-policy-and-why-you-need-one) any vulnerabilities you find. 

A lot of the work of finding vulnerabilities comes from looking at the code and running tools like [slither](https://github.com/crytic/slither). For this $2.2M payout, Leon said he was able to find the bug by looking line-by-line at the smart contract code, so remember, finding vulnerabilities is often a huge manual lift! 

In addition to the practical tips below, Leon's biggest takeaway was for smart contract bug hunters to "find your edge," but what does he mean by that? Typically, this means finding that thing that sets you apart from other hackers. We as a community need to cover every corner of the smart contract space, so find a section that you are specifically good at and excel. 

Here are the seven strategies and tips to help find your edge, to make you a successful smart contract bug hunter. 


## 1. Find a Project and Search For Bugs

The first way you can find bugs is to know every inch of how a protocol works. This is one of the first skills every smart contract bug hunter needs to be learn: the ability to understand a protocol end to end.

Go through docs, try to reimplement a protocol yourself, and view transactions through that protocol on a block explorer.

Leon said this strategy works for other hunters but not him. He focuses on the next three, but it’s important for every bug hunter to be able to do this. 


## 2. Find a Bug and Search For Projects

An easier approach to hunting for bugs is to find a bug that not a lot of people know about and try to see which protocols have implemented it. 

This strategy takes a lot of research, as there are a lot of people working on [exposing bugs to the general public](https://swcregistry.io/). 

You first need to understand the [top smart contract exploits](https://swcregistry.io/) and then their advanced versions. You need to be aware of best practices and see if there are protocols that have not been followed them. 

Once you find a smart contract bug you think a lot of projects might not have protected against, start searching for that bug. Get really familiar with this new bug and how to find it. And be sure to write a blog or some kind of post to help other smart contract developers who run into this bug protect themselves. 


## 3. Be Fast

Projects that want bug hunters to look at their smart contracts need to sign up for bug bounty programs like [Immunefi](https://immunefi.com/). And you'll want to be one of the first developers to find the new bounties. If you start looking at a contract before other hunters, you’ll have more time to find a bug than other hunters. 

There are a few ways to be fast—one of the ways Leon was able to find the smart contract vulnerability before others was by having notifications on for the [Immunifi updates Discord channel](https://discord.gg/nVE8WqH3MH). He received a notification anytime a new project came in, or a project was updated. Tools like this can help you get to digging into code before anyone else does.


## 4. Be Creative

Another way Leon was able to get an edge, was traversing [community forums](https://forum.makerdao.com/), and finding out they were thinking about submitting a bug. He'd then start looking at the smart contracts even before the bounty was approved. This gave him way more time to look at a contract than other developers, since they would wait for a bug bounty to be submitted. 


## 5. Know Your Tooling

Bug hunters use tools like the VSCode Solidity visual developer extension, Hardhat, Foundry, Brownie, Dune, Etherscan, plus a host of others. 

A typical bug hunting strategy might be loading up VSCode, adding the code to VSCode with the Solidity visual extension, and going line by line looking for common bugs or bad best practices. 

After finding a weakness, setting up a testing environment to run tests on the contract is a good next step. You can often reuse a lot of the tests the developers of the protocol originally used. 


## 6. Don’t Be Afraid of Audited Projects

Not much else to say here. Audit firms make mistakes. Many of the projects Leon found vulnerabilities for had been audited by top firms.

Using the skills we talked about in this blog can be the difference for you to find these issues! 


## 7. Industry-Specific Knowledge

One of the biggest advantages in finding your edge is specializing in a specific niche. If you understand one area incredibly well, you’ll have the advantage of knowing how all the functions interact with each other. If you’re a phenomenal smart contract vulnerability expert but don’t know anything about DeFi, it’ll be hard to find vulnerabilities in DeFi contracts. For example, a lot of developers understand code, but don't understand financial primitives. 

You could get incredibly good at understanding decentralized exchanges, borrowing protocols, or maybe just NFTs!

If you can become a master of security and a master of a certain vertical within Web3, you'll be well-positioned to have a massive leg up on everyone else looking for bugs. 


## Summary

I hope this piece is useful to you in your smart contract bug-hunting journey. If you want to learn more about security when writing your smart contracts, be sure to check out [Top Ten DeFi Security Best Practices](https://blog.chain.link/defi-security-best-practices/).

And, as always, I hope to see you out there building and keeping the ecosystem a little safer. 


## Links

[MRC20 contract.](https://polygonscan.com/address/0x0000000000000000000000000000000000001010#code)

[Immunefi writeup.](https://medium.com/immunefi/polygon-lack-of-balance-check-bugfix-postmortem-2-2m-bounty-64ec66c24c7d) 

[Change to Polygon contracts](https://github.com/maticnetwork/contracts/commit/55e8118ad406c9cb0e9b457ca4f275c5977809e4#diff-cc4ed03464edad9d87d48cff647eb6940dfe9a4c419f63e3994bdc91b01bfecb). 

[Previous Polygon contracts.](https://github.com/maticnetwork/contracts/blob/56ec7eb257ce10a9f70621f56f6e3f37eb8e0c57/contracts/child/MRC20.sol)

[Ecrecovery challenge.](https://github.com/code-423n4/2021-09-swivel-findings/issues/61) 