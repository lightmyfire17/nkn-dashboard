# New Kind Of Dashboard
New Kind Of Dashboard — web dashboard for NKN users, containing the following features:

* Balance Check
* Mining Calculator
* Node Tracker
* Wallets Tracker
* Network Blocks Tracker
* NKN's Twitter Feedback

At the moment, the application is not available online, but you can download and run it offline.

> New features will be implemented into [nknX](https://github.com/nknx-org/nknx).

## Node Tracking
To start tracking state of nodes, you need to add the ip addresses of your nodes into the script via following steps:

1) Go to `nkn-dashboard/js`
2) Open core script file `common.js`
3) Find line 41 and add ip of your node into array:
```Line 41
nodes: ['142.93.142.26', '167.99.2.183']
```
4) Save changes and reload page

> You can add as many nodes as you want.

## Wallets Tracker
To start tracking balance of your wallet, you need to add the NKN address and name of your wallet into the script via following steps:

1) Go to `nkn-dashboard/js`
2) Open core script file `common.js`
3) Find line 45 and add ip of your node into array:
```Line 45
wallets: [{
                "label": "Yilun",
                "address": "Ndf68RHvgwQk5U6caHg9CuUnooeLGZ5UzS",
                "balance": null,
                "balanceUsd": null,
                "preview": ""
            },
            {
                "label": "SF",
                "address": "NNHaXsaStomYG77RWNT1q6UvymKtbuejtj",
                "balance": null,
                "balanceUsd": null,
                "preview": ""
            }]
```
4) Save changes and reload page

> You can add as many wallets as you want.

## NKN Resources
* [Official Website](https://www.nkn.org/)
* [Testnet](http://testnet.nkn.org/)
* [NKNx](https://nknx.org/)

## NKN Community
* [Discord](https://discord.gg/c7mTynX)
* [Telegram](https://t.me/nknorg)
* [Reddit](https://www.reddit.com/r/nknblockchain/)
* [Twitter](https://twitter.com/NKN_ORG)
