var contract;
var account;
var x;


$(async function(){
    await initContract();
    await setData();

    $(".confirmation").on("click", async function(){
      await join($("#amount").val);
    }); 

    $("#join").on("click", function(){
      var displayBox = $(".join");
      if(displayBox.css("display") == "none")
        displayBox.fadeIn(150);
      else displayBox.fadeOut(150);
    });
    x = setInterval(setData, 1000);
})

async function initContract(){
    var web3 = new Web3(window.ethereum);

    if(window.ethereum){
      await ethereum.enable();
    }
    else if(window.web3) {
      web3 = new Web3(window.web3.currentProvider);
    }

    var address = "0x22608C4c8ee72Cef7227CABE788FD76D92563175";
    var abi = [
      {
        "inputs": [],
        "stateMutability": "payable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address[]",
            "name": "_participants",
            "type": "address[]"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "_winner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "_prize",
            "type": "uint256"
          }
        ],
        "name": "Completed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "_winner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "_prize",
            "type": "uint256"
          }
        ],
        "name": "Drawn",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "_length",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "_qty",
            "type": "uint256"
          }
        ],
        "name": "Joined",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Paid",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "availableTickets",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getParticipants",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_qty",
            "type": "uint256"
          }
        ],
        "name": "join",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "price",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "started",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    await web3.eth.getAccounts(function(err, accounts) {
      if (err != null) {
        alert("Error retrieving accounts.");
        return;
      }
      if (accounts.length == 0) {
        alert("No account found! Make sure the Ethereum client is configured properly.");
        return;
      }
      account = accounts[0];
      web3.eth.defaultAccount = account;
    });

    contract = new web3.eth.Contract(abi, address);
}

async function setData() {
  var price = await contract.methods.price().call();
  var prize = await contract.methods.getBalance().call();
  var participants = await contract.methods.getParticipants().call();
  $("#price").html("Vieno bilieto kaina: " + price + " wei");
  $("#prize").html("Dabartinis prizas: " + prize + " wei");
  $("#participants").html("Dabar bilietų yra: " + participants.length);
}

async function join() {
  var number = $("#amount")[0].value;
  if(number > 0 && number != null){
    var price = await contract.methods.price().call();
    const receipt = await contract.methods.join(number).send( {from: account, value: number*price});
    if(typeof receipt.events.Completed !== "undefined"){
      clearInterval(x);
      var winning = receipt.events.Completed.returnValues._winner;
      var participating = receipt.events.Completed.returnValues._participants.length;
      var prizePool = receipt.events.Completed.returnValues._prize;     
      $("#prize").html("Dabartinis prizas: " + prizePool + " wei");
      $("#participants").html("Dabar bilietų yra: " + participating);
      $(".join").fadeOut(50);
      $(".winners").fadeIn(2500);
      $("#diceSelector").html("The winner is: " + winning);
      setTimeout(() => {$("#diceSelector").fadeOut(2500); x=setInterval(setData, 1000);}, 5000);
    }
  }
}

