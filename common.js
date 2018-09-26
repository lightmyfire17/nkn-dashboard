function checkBalance() {
    nknWallet.configure({
        rpcAddr: 'http://testnet-node-0001.nkn.org:30003/',
    });
    var wallet = ''
    var result = wallet
    $('#checkBalance').click(function(event) {
        getbalance()
    });

    var walletFromJson = "";
    var lines = `{"Version":"0.0.1","PasswordHash":"be2ef4971b24405df0541f95fe6158ac661e69971337ff7260b219d1056ebc3b","MasterKey":"cb6624d3be4b23ba9fb9ed746595817ebc0e63a44772175a638548ca264a329f","IV":"2a18decef1149b47fc9f50965b055b2b","PrivateKeyEncrypted":"5158f5e75067629c963524f30e62df14cc3cbf37422f72e23c2fce9b303d11af","Address":"NcNRJJZoQBpEZhFfHM5Gjrzc9bSK6kda7u","ProgramHash":"b482a02031a097da723e8121b54bfe6671b9e576","ContractData":"232103b9b80d4d3d25bc7719fe7a45aa283346488988179bbc1852d705ef470930cb74ac0100b482a02031a097da723e8121b54bfe6671b9e576"}`
    var p = `test`;
    walletFromJson = nknWallet.loadJsonWallet(lines, p);

    function getbalance() {
        result = $('#wallet').val()
        walletFromJson.address = result;
        walletFromJson.queryAssetBalance().then(function(value) {
            this.balance = value.toString()
            $('.walletData').addClass('active')
            $('.walletBalance').text(this.balance);


        }).catch(function(error) {
            $('.walletData').addClass('active')
            $('.walletBalance').text('0');
        });
    }
}

"use strict"

Vue.use(VueMaterial.default)


var app = new Vue({

    data: {
    	// ADD YOUR NODES' IP INTO ARRAY BELOW
    	nodes: ['142.93.142.26', '167.99.2.183'],
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
        usdProfit: 0,
        isLoading: true,
        nodesData: [],
        latestBlock: '',
        allNodes: '',
        latestBlocks: [],
        balance: 0,
        wallet: ''
    },
    beforeMount() {

        loadData()


    },
    mounted() {
        setTimeout(() => {
            this.isLoading = false
        }, 1500)


    },

    updated: function() {
        testnetCalc()
        checkBalance()
    },
    methods: {
        loadData: function() {
            axios.get('https://api.coinmarketcap.com/v2/ticker/2780/')
                .then(response => {
                    this.nknPrice = response.data.data.quotes.USD.price.toFixed(3)
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
                    "method": "getconnectioncount",
                    "params": {},
                    "id": 1
                })
                .then((response) => {
                    this.allNodes = response.data.result

                })
                .catch((error) => {});


            for (var i = 0; i < this.nodes.length; i++) {
                axios.post('http://' + this.nodes[i] + ':30003/', {
                        "jsonrpc": "2.0",
                        "method": "getnodestate",
                        "params": {},
                        "id": 1
                    })
                    .then((response) => {
                        this.nodesData.push(response.data.result)

                    })
                    .catch((error) => {
                        this.nodesData.push({ 'Addr': error.config.url, 'SyncState': 'Error' })
                    });

                axios.post('http://' + this.nodes[i] + ':30003/', {
                        "jsonrpc": "2.0",
                        "method": "getlatestblockheight",
                        "params": {},
                        "id": 1
                    })
                    .then((response) => {
                        this.latestBlocks.push(response.data.result)
                    })

            }
        }
        testnetCalc: function() {
            var secDay = 86400
            var dailyMined = (secDay / this.blocktime) * 10
            this.testTokensDaily = dailyMined * this.userNodes / this.totalNodes
            this.totalTestTokens = this.testTokensDaily * 30 * this.nodeTime
            this.totalMainTokens = this.totalTestTokens / 5
            this.usdProfitPerDay = this.testTokensDaily / 5 * this.nknPrice
            this.usdProfit = this.nknPrice * this.totalMainTokens
        }
    }

})

app.$mount("#app")