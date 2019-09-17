getBalance = function() {
  let nknPrice = 0;
  axios
    .get("https://price.nknx.org/price?quote=NKN&currency=USD")
    .then(response => {
      nknPrice = response.data[0].prices[0].price.toFixed(3);
      nknWallet.configure({
        rpcAddr: "http://mainnet-seed-0003.nkn.org:30003/"
      });
      const wallet = nknWallet.newWallet("password");
      let updatedBalance = 0;
      let result = $("#wallet").val();
      wallet.address = result;
      wallet
        .getBalance()
        .then(function(value) {
          updatedBalance = value.toString();
          updatedBalanceUsd = updatedBalance * nknPrice;
          $(".walletData").addClass("active");
          $(".walletBalance").text(updatedBalance);
          $(".walletBalanceUsd").text("$" + updatedBalanceUsd.toFixed(2));
        })
        .catch(function(error) {
          $(".walletData").addClass("active");
          $(".walletBalance").text(error);
          $(".walletBalanceUsd").text(error);
        });
    });
};

("use strict");

Vue.use(VueMaterial.default);

let app = new Vue({
  data() {
    return {
      // ADD YOUR NODES' IP INTO ARRAY BELOW
      nodes: ["64.52.23.142"],
      // ADD YOUR WALLETS ADDRESSES HERE
      wallets: [
        {
          label: "MBA",
          address: "NKNaaaaaaaaaaaaaaaaaaaaaaaaaaaeJ6gxa",
          balance: null,
          balanceUsd: null,
          preview: ""
        }
      ],
      refreshTime: "60",
      activeItem: "wallet",
      nknPrice: "Loading...",
      userNodes: 1,
      totalNodes: 1,
      blocktime: 20,
      nodeTime: 1,
      testTokensDaily: 0,
      totalTestTokens: 0,
      totalMainTokens: 0,
      usdProfitPerDay: 0,
      bandWidthCost: 0,
      latestTiming: "",
      nodeCost: 0,
      usdProfit: 0,
      isLoading: true,
      nodesData: [],
      latestBlock: "Loading...",
      allNodes: "",
      latestBlocks: [],
      balance: 0,
      nodesLength: null,
      wallet: "",
      tweets: [],
      showing: 0,
      blockCounter: 0,
      walletAddress: "",
      walletBalanceUsd: 0,
      nknCap: 0,
      nknVolume: 0,
      nknRank: 0,
      nkn24: 0,
      relayedMessages: 0,
      crawlCounter: "Loading...",
      nknWeekly: 0,
      seedVersion: "",
      time: "",
      timer: "",
      miners: [],
      currentOrder: "default",
      refreshActive: {
        title: "Enable",
        active: false
      },
      nodesDataCounter: {
        all: 0,
        pf: 0,
        ss: 0,
        sf: 0,
        ws: 0,
        er: 0
      }
    };
  },
  created() {
    this.nodesLength = this.nodes.length;
    this.loadData();
  },
  mounted() {
    this.fetch();
    setInterval(this.rotate, 6000);
  },
  updated() {
    this.testnetCalc();
  },
  computed: {
    sortedArray: function() {
      let customNodes = [];
      if (this.currentOrder === "default") {
        function compare(a, b) {
          if (a.syncState < b.syncState) return -1;
          if (a.syncState > b.syncState) return 1;
          return 0;
        }
        return this.nodesData.sort(compare);
      } else {
        for (i = 0; i < this.nodesData.length; i++) {
          if (this.nodesData[i].syncState === this.currentOrder) {
            customNodes.push(this.nodesData[i]);
          }
        }
        return customNodes;
      }
    },
    sortedMiners: function() {
      function compare(a, b) {
        if (a.height > b.height) return -1;
        if (a.height < b.height) return 1;
        return 0;
      }
      return this.miners.sort(compare);
    }
  },
  methods: {
    //Preloader spinner and data render
    preload: function() {
      this.isLoading = true;
      if (this.nodes.length === this.nodesData.length) {
        this.getNodesCount();
        this.getMiners();
        this.getNodesDataCounter();
        this.getLatestBlock();
        this.getSeedNodeState();
        this.getPrice();
        this.getWalletsBalance();
        setTimeout(() => {
          this.isLoading = false;
        }, 1500);
      } else {
        setTimeout(() => {
          this.preload();
        }, 1000);
      }
    },
    //Refresh button
    refreshToggle: function() {
      clearInterval(this.timer);
      this.refreshActive.active = !this.refreshActive.active;
      if (this.refreshActive.title === "Enable") {
        this.refreshActive.title = "Disable";
      } else {
        this.refreshActive.title = "Enable";
      }
      this.timer = setInterval(this.autoRefresh, this.refreshTime * 1000);
    },
    //Auto Refresh trigger
    autoRefresh: function() {
      if (this.refreshActive.active === true) {
        this.loadData();
      }
    },

    //Get wallets balance from array
    getWalletsBalance: function() {
      const self = this;
      nknWallet.configure({
        rpcAddr: "http://mainnet-seed-0003.nkn.org:30003/"
      });
      let updatedBalance = 0;
      for (let i = 0; i < self.wallets.length; i++) {
        self.wallets[i].preview = self.wallets[i].label.charAt(0);
        const wallet = nknWallet.newWallet("password");
        wallet.address = self.wallets[i].address;
        wallet
          .getBalance()
          .then(function(value) {
            self.wallets[i].balance = value.toString();
            self.wallets[i].balanceUsd = (
              self.wallets[i].balance * self.nknPrice
            ).toFixed(2);
          })
          .catch(function(error) {
            self.wallets[i].balance = "query balance fail";
          });
      }
    },
    //Get current node count in NKN network
    getNodesCount: function() {
      axios.get("https://api.nknx.org/crawledNodes", {}).then(response => {
        this.crawlCounter = response.data.length;
      });
      if (this.crawlCounter != "Loading...") {
        this.totalNodes = this.crawlCounter;
      } else {
        this.totalNodes = 1;
      }
    },
    //Get mempool, status, version of seed node
    getSeedNodeState: function() {
      axios
        .post("http://mainnet-seed-0003.nkn.org:30003/", {
          jsonrpc: "2.0",
          method: "getnodestate",
          params: {},
          id: 1
        })
        .then(response => {
          this.seedStatus = response.data.result.syncState;
          this.relayedMessages = response.data.result.relayMessageCount;
        })
        .catch(error => {});

      axios
        .post("http://mainnet-seed-0003.nkn.org:30003/", {
          jsonrpc: "2.0",
          method: "getversion",
          params: {},
          id: 1
        })
        .then(response => {
          this.seedVersion = response.data.result;
        })
        .catch(error => {});
    },
    //Get NKN price data
    getPrice: function() {
      axios
        .get("https://price.nknx.org/price?quote=NKN&currency=USD")
        .then(response => {
          this.nknPrice = response.data[0].prices[0].price.toFixed(3);
          this.nknRank = response.data[0].cmc_rank;
          this.nknCap = (
            response.data[0].prices[0].market_cap / 1000000
          ).toFixed(2);
          this.nknVolume = (
            response.data[0].prices[0].volume_24h / 1000000
          ).toFixed(2);
          this.nkn24 = response.data[0].prices[0].percent_change_24h.toFixed(2);
          this.nknWeekly = response.data[0].prices[0].percent_change_7d.toFixed(
            2
          );
        });
    },
    //Get data for user nodes and latest seed node block || Nodes page.
    loadData: function() {
      this.userNodes = this.nodesLength;
      this.nodesData = [];
      this.latestBlocks = [];

      axios
        .post("http://mainnet-seed-0003.nkn.org:30003/", {
          jsonrpc: "2.0",
          method: "getlatestblockheight",
          params: {},
          id: 1
        })
        .then(response => {
          this.latestBlock = response.data.result;
          this.blockCounter = response.data.result;
        })
        .catch(error => {});

      for (let i = 0; i < this.nodesLength; i++) {
        axios
          .post("http://" + this.nodes[i] + ":30003/", {
            jsonrpc: "2.0",
            method: "getnodestate",
            params: {},
            id: 1
          })
          .then(response => {
            this.nodesData.push(response.data.result);
          })
          .catch(error => {
            this.nodesData.push({
              addr: this.nodes[i],
              syncState: "ERROR"
            });
          });
      }

      //Start preload function
      this.preload();
    },
    //Get latest Blocks of Seed Node || Blocks page.
    getLatestBlock: function() {
      axios
        .post("http://mainnet-seed-0003.nkn.org:30003/", {
          jsonrpc: "2.0",
          method: "getblock",
          params: {
            height: this.latestBlock
          },
          id: 1
        })
        .then(response => {
          let timestamp = response.data.result.header.timestamp * 1000;
          let previous = new Date(timestamp);
          let current = new Date();
          let msPerMinute = 60 * 1000;
          let msPerHour = msPerMinute * 60;
          let msPerDay = msPerHour * 24;
          let msPerMonth = msPerDay * 30;
          let msPerYear = msPerDay * 365;
          let blockStamp = "";
          let elapsed = current - previous;

          if (elapsed < msPerMinute) {
            blockStamp = Math.round(elapsed / 1000) + " seconds ago";
          } else if (elapsed < msPerHour) {
            blockStamp = Math.round(elapsed / msPerMinute) + " minutes ago";
          } else if (elapsed < msPerDay) {
            blockStamp = Math.round(elapsed / msPerHour) + " hours ago";
          } else if (elapsed < msPerMonth) {
            blockStamp =
              "approximately " + Math.round(elapsed / msPerDay) + " days ago";
          } else if (elapsed < msPerYear) {
            blockStamp =
              "approximately " +
              Math.round(elapsed / msPerMonth) +
              " months ago";
          } else {
            blockStamp =
              "approximately " + Math.round(elapsed / msPerYear) + " years ago";
          }

          this.latestTiming = blockStamp;
        });
    },
    //Get coounters of user nodes states || Nodes page.
    getNodesDataCounter: function() {
      this.nodesDataCounter.pf = 0;
      this.nodesDataCounter.sf = 0;
      this.nodesDataCounter.ss = 0;
      this.nodesDataCounter.er = 0;
      this.nodesDataCounter.ws = 0;
      this.nodesDataCounter.all = this.nodesData.length;

      for (let i in this.nodesData) {
        switch (this.nodesData[i].syncState) {
          case "PERSIST_FINISHED":
            this.nodesDataCounter.pf++;
            break;
          case "SYNC_FINISHED":
            this.nodesDataCounter.sf++;
            break;
          case "SYNC_STARTED":
            this.nodesDataCounter.ss++;
            break;
          case "WAIT_FOR_SYNCING":
            this.nodesDataCounter.ws++;
            break;
          case "ERROR":
            this.nodesDataCounter.er++;
            break;
        }
      }
    },
    //Get Block History data || Blocks page.
    getMiners: function() {
      this.blockCounter = this.latestBlock;
      this.miners = [];
      for (let i = 0; i < 20; i++) {
        axios
          .post("http://mainnet-seed-0003.nkn.org:30003/", {
            jsonrpc: "2.0",
            method: "getblock",
            params: {
              height: this.blockCounter
            },
            id: 1
          })
          .then(response => {
            let timestamp = response.data.result.header.timestamp * 1000;
            let previous = new Date(timestamp);
            let current = new Date();
            let msPerMinute = 60 * 1000;
            let msPerHour = msPerMinute * 60;
            let msPerDay = msPerHour * 24;
            let msPerMonth = msPerDay * 30;
            let msPerYear = msPerDay * 365;
            let blockStamp = "";
            let elapsed = current - previous;

            if (elapsed < msPerMinute) {
              blockStamp = Math.round(elapsed / 1000) + " seconds ago";
            } else if (elapsed < msPerHour) {
              blockStamp = Math.round(elapsed / msPerMinute) + " minutes ago";
            } else if (elapsed < msPerDay) {
              blockStamp = Math.round(elapsed / msPerHour) + " hours ago";
            } else if (elapsed < msPerMonth) {
              blockStamp =
                "approximately " + Math.round(elapsed / msPerDay) + " days ago";
            } else if (elapsed < msPerYear) {
              blockStamp =
                "approximately " +
                Math.round(elapsed / msPerMonth) +
                " months ago";
            } else {
              blockStamp =
                "approximately " +
                Math.round(elapsed / msPerYear) +
                " years ago";
            }
            this.miners.push({
              height: response.data.result.header.height,
              time: blockStamp,
              hash: response.data.result.hash,
              tx: response.data.result.transactions.length
            });
          });
        this.blockCounter--;
      }
    },
    //Calculator.
    testnetCalc: function() {
      const secDay = 86400;
      let dailyMined = (secDay / this.blocktime) * 15;
      let totalNodeCost = this.nodeCost * this.nodeTime * this.userNodes;
      let totalBandwidthCost =
        this.bandWidthCost * this.nodeTime * this.userNodes;
      let dailyNodeCost = (this.nodeCost / 30) * this.userNodes;
      let dailyBandwidthCost = (this.bandWidthCost / 30) * this.userNodes;
      this.testTokensDaily = (
        (dailyMined * this.userNodes) /
        this.totalNodes
      ).toFixed(0);
      this.totalTestTokens = (
        this.testTokensDaily *
        30 *
        this.nodeTime
      ).toFixed(0);
      this.totalMainTokens = (this.totalTestTokens / 5).toFixed(0);
      this.usdProfitPerDay = (
        (this.testTokensDaily / 5) * this.nknPrice -
        dailyBandwidthCost -
        dailyNodeCost
      ).toFixed(2);
      this.usdProfit = (
        this.nknPrice * this.totalMainTokens -
        totalBandwidthCost -
        totalNodeCost
      ).toFixed(2);
    },

    fetch: function() {
      let LatestTweets = {
        customCallback: this.setTweets,
        profile: {
          screenName: "nkn_org"
        },
        domId: "latest-tweets",
        maxTweets: 20,
        enableLinks: true,
        showUser: true,
        showTime: true,
        showImages: true,
        lang: "en",
        showRetweet: false
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
      this.showing += 0.5;
      setTimeout(
        function() {
          this.showing += 0.5;
        }.bind(this),
        600
      );
    },
    checkBalance: function() {
      getBalance();
    }
  }
});

app.$mount("#app");
