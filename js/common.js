getBalance = function() {
    var nknPrice
    axios.get('https://api.coinmarketcap.com/v2/ticker/2780/')
        .then(response => {
            nknPrice = response.data.data.quotes.USD.price.toFixed(3)
        })

    nknWallet.configure({
        rpcAddr: 'http://testnet-node-0001.nkn.org:30003/',
    });
    var walletFromJson = "";
    var lines = `{"Version":"0.0.1","PasswordHash":"be2ef4971b24405df0541f95fe6158ac661e69971337ff7260b219d1056ebc3b","MasterKey":"cb6624d3be4b23ba9fb9ed746595817ebc0e63a44772175a638548ca264a329f","IV":"2a18decef1149b47fc9f50965b055b2b","PrivateKeyEncrypted":"5158f5e75067629c963524f30e62df14cc3cbf37422f72e23c2fce9b303d11af","Address":"NcNRJJZoQBpEZhFfHM5Gjrzc9bSK6kda7u","ProgramHash":"b482a02031a097da723e8121b54bfe6671b9e576","ContractData":"232103b9b80d4d3d25bc7719fe7a45aa283346488988179bbc1852d705ef470930cb74ac0100b482a02031a097da723e8121b54bfe6671b9e576"}`
    var p = `test`;
    let updatedBalance = 0
    walletFromJson = nknWallet.loadJsonWallet(lines, p);
    var result = $('#wallet').val()
    walletFromJson.address = result;
    walletFromJson.queryAssetBalance().then(function(value) {
        updatedBalance = value.toString()
        updatedBalanceUsd = updatedBalance * nknPrice / 5
        $('.walletData').addClass('active')
        $('.walletBalance').text(updatedBalance)
        $('.walletBalanceUsd').text('$' + updatedBalanceUsd.toFixed(2))
    }).catch(function(error) {
        $('.walletData').addClass('active')
        $('.walletBalance').text(error)
        $('.walletBalanceUsd').text(error)
    });
}

"use strict"

Vue.use(VueMaterial.default)


var app = new Vue({

    data: {
        // ADD YOUR NODES' IP INTO ARRAY BELOW
        nodes: [
            '46.101.217.170'
        ],
        activeItem: 'wallet',
        nknPrice: 0,
        userNodes: 1,
        totalNodes: 1,
        blocktime: 12,
        nodeTime: 1,
        testTokensDaily: 0,
        totalTestTokens: 0,
        totalMainTokens: 0,
        usdProfitPerDay: 0,
        bandWidthCost: 1,
        nodeCost: 1,
        usdProfit: 0,
        isLoading: true,
        nodesData: [],
        latestBlock: '',
        allNodes: '',
        latestBlocks: [],
        balance: 0,
        wallet: '',
        tweets: [],
        showing: 0,
        walletAddress: '',
        walletBalanceUsd: 0,
        nknCap: 0,
        nknVolume: 0,
        nknRank: 0,
        nkn24: 0,
        nknWeekly: 0,
        seedVersion: '',
        time: '',
        currentOrder: 'default'
    },
    created() {
        this.loadData()
    },
    mounted() {
        this.preload()
        this.fetch();
        setInterval(this.rotate, 6000);
        setInterval(this.loadData, 60000);
        setInterval(this.preload, 60010);
    },
    updated() {
        this.testnetCalc()
    },
    computed: {
        sortedArray: function() {
            var customNodes = []
            if (this.currentOrder === 'default') {
                function compare(a, b) {
                    if (a.SyncState < b.SyncState)
                        return -1;
                    if (a.SyncState > b.SyncState)
                        return 1;
                    return 0;
                }
                return this.nodesData.sort(compare);
            } else {
                for (i = 0; i < this.nodesData.length; i++) {
                    if (this.nodesData[i].SyncState === this.currentOrder) {
                        customNodes.push(this.nodesData[i])
                    }
                }
                return customNodes
            }
        }
    },
    methods: {
        preload: function() {
            this.isLoading = true
            if (this.nodesData.length === this.nodes.length) {
                this.getBlocks()
                this.getVersion()
                setTimeout(() => {
                    this.isLoading = false
                }, 1000)

            } else {
                setTimeout(() => {
                    this.preload()
                }, 1000)
            }

        },
        loadData: function() {
            this.nodesData = []
            this.latestBlocks = []
            axios.get('https://api.coinmarketcap.com/v2/ticker/2780/')
                .then(response => {
                    this.nknPrice = response.data.data.quotes.USD.price.toFixed(3)
                    this.nknRank = response.data.data.rank
                    this.nknCap = ((response.data.data.quotes.USD.market_cap) / 1000000).toFixed(2)
                    this.nknVolume = ((response.data.data.quotes.USD.volume_24h) / 1000).toFixed(2)
                    this.nkn24 = response.data.data.quotes.USD.percent_change_24h
                    this.nknWeekly = response.data.data.quotes.USD.percent_change_7d
                })

            axios.post('http://testnet-node-0001.nkn.org:30003/', {
                    "jsonrpc": "2.0",
                    "method": "getlatestblockheight",
                    "params": {},
                    "id": 1
                })
                .then((response) => {
                    this.latestBlock = response.data.result

                })
                .catch((error) => {});

            axios.post('http://testnet-node-0001.nkn.org:30003/', {
                    "jsonrpc": "2.0",
                    "method": "getnodestate",
                    "params": {},
                    "id": 1
                })
                .then((response) => {
                    this.seedStatus = response.data.result.SyncState
                })
                .catch((error) => {});

            axios.post('http://testnet-node-0001.nkn.org:30003/', {
                    "jsonrpc": "2.0",
                    "method": "getversion",
                    "params": {},
                    "id": 1
                })
                .then((response) => {
                    this.seedVersion = response.data.result

                })
                .catch((error) => {});


            for (let i = 0; i < this.nodes.length; i++) {
                axios.post('http://' + this.nodes[i] + ':30003/', {
                        "jsonrpc": "2.0",
                        "method": "getnodestate",
                        "params": {},
                        "id": 1
                    })
                    .then((response) => {
                        this.nodesData.push(response.data.result)

                    })
                    .catch((response) => {
                        if (response.status == undefined) {
                            axios.post('http://' + this.nodes[i] + ':40003/', {
                                    "jsonrpc": "2.0",
                                    "method": "getnodestate",
                                    "params": {},
                                    "id": 1
                                })
                                .then((response) => {
                                    this.nodesData.push(response.data.result)

                                })
                                .catch((error) => {
                                    this.nodesData.push({ 'Addr': this.nodes[i], 'SyncState': 'Error' })
                                });
                        }

                    })
            }
        },
        getBlocks: function() {
            for (let i = 0; i < this.nodesData.length; i++) {
                axios.post('http://' + this.nodesData[i].Addr + ':30003/', {
                        "jsonrpc": "2.0",
                        "method": "getlatestblockheight",
                        "params": {},
                        "id": 1
                    })
                    .then((response) => {
                        this.nodesData[i].latestBlocks = response.data.result
                    })
                    .catch((response) => {
                        if (response.status == undefined) {
                            axios.post('http://' + this.nodesData[i].Addr + ':40003/', {
                                    "jsonrpc": "2.0",
                                    "method": "getlatestblockheight",
                                    "params": {},
                                    "id": 1
                                })
                                .then((response) => {
                                    this.nodesData[i].latestBlocks = response.data.result
                                })
                        }
                    })
            }
        },
        getVersion: function() {
            for (let i = 0; i < this.nodesData.length; i++) {
                axios.post('http://' + this.nodesData[i].Addr + ':30003/', {
                        "jsonrpc": "2.0",
                        "method": "getversion",
                        "params": {},
                        "id": 1
                    })
                    .then((response) => {
                        this.nodesData[i].version = response.data.result
                    })
                    .catch((response) => {
                        if (response.status == undefined) {
                            axios.post('http://' + this.nodesData[i].Addr + ':40003/', {
                                    "jsonrpc": "2.0",
                                    "method": "getversion",
                                    "params": {},
                                    "id": 1
                                })
                                .then((response) => {
                                    this.nodesData[i].version = response.data.result
                                })
                        }
                    })
            }
        },
        testnetCalc: function() {
            var secDay = 86400
            var dailyMined = (secDay / this.blocktime) * 10
            var totalNodeCost = this.nodeCost * this.nodeTime * this.userNodes
            var totalBandwidthCost = this.bandWidthCost * this.nodeTime * this.userNodes
            var dailyNodeCost = this.nodeCost / 30 * this.userNodes
            var dailyBandwidthCost = this.bandWidthCost / 30 * this.userNodes
            this.testTokensDaily = dailyMined * this.userNodes / this.totalNodes
            this.totalTestTokens = this.testTokensDaily * 30 * this.nodeTime
            this.totalMainTokens = this.totalTestTokens / 5
            this.usdProfitPerDay = this.testTokensDaily / 5 * this.nknPrice - dailyBandwidthCost - dailyNodeCost
            this.usdProfit = this.nknPrice * this.totalMainTokens - totalBandwidthCost - totalNodeCost
        },

        fetch: function() {
            var LatestTweets = {
                "customCallback": this.setTweets,
                "profile": { "screenName": 'nkn_org' },
                "domId": 'exampleProfile',
                "maxTweets": 20,
                "enableLinks": true,
                "showUser": true,
                "showTime": true,
                "showImages": true,
                "lang": 'en'

            };
            twitterFetcher.fetch(LatestTweets);
        },
        setTweets(tweets) {
            this.tweets = tweets;
        },
        rotate: function() {
            if (this.showing == this.tweets.length - 1) {
                this.showing = -1;
            }
            this.showing += .5;
            setTimeout(function() {
                this.showing += .5;
            }.bind(this), 600);

        },
        checkBalance: function() {
            getBalance()

        }
    }

})

app.$mount("#app")