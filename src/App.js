import React, { useEffect, useState } from "react"
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/myEpicNFT.json';
import { ethers } from 'ethers';

// Constants
const TWITTER_HANDLE = 'srthkv';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0xf0fc0df235e468AcB5A29bdaD8A47c5a09bD0071";

export const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [tokenId, setTokenId] = useState('');

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;
		if(ethereum) {
			console.log("Got the ethereum obejct: ", ethereum);
		} else {
			console.log("Connect your wallet first!");
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if(accounts.length !== 0) { // ie. some account found
			console.log("Found authorized Account: ", accounts[0]);
			setCurrentAccount(accounts[0]);

			// setup listener for when user comes and his wallet is already conencted
			setupEventListener();
		} else {
			console.log("No authorized account found");
		}
	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			if(!ethereum) {
				alert("Get Metamask!");
				return;
			}
			
			const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
			console.log("Wallet connected: ", accounts[0]);

			// setup listener when user comes for the first time and connect wallet
			setCurrentAccount();
		} catch(error) {
			console.log(error);
		}
	}	

	// setup event listener
	const setupEventListener = () => {
		try {
			const { ethereum } = window;
			if(ethereum) {
				// Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

				// This is magic stuff.
				// It will caputure our event when our contract throws it
				connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
					console.log(from, tokenId.toNumber());
					setTokenId(tokenId.toNumber());

          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
				});
				console.log('setup event listener!');
			} else {
				console.log("Ethereum obj doesn't exists.");
			}
		} catch(error) {
			console.log(error);
		}
	}

	const askContractToMintNFT = async () => {
		try {
			const { ethereum } = window;

			if(ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

				console.log("Going to pop wallet now to pay gas.");
				let nftTxn = await connectedContract.makeAnEpicNFT();

				console.log("Mining... Please Wait!");
				await nftTxn.wait();

				console.log(`Mined, see transation https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
			} else {
				console.log("Ethereum obejct doesn't exist.");
			}


		} catch(error) {
			console.log(error);
		}
	}

	const getTotalNftMintedSoFar = () => {
		// need to get newTokenId variable from makeAnEpicNFT()
		console.log('Token ID: ', tokenId);
	}

  // Render Methods
  const RenderNotConnected = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

	const RendorMintUI = () => (
		<button className="cta-button connect-wallet-button" onClick={askContractToMintNFT}>
			Mint NFT
		</button>
	);

	useEffect(() => {
		checkIfWalletIsConnected();
		getTotalNftMintedSoFar();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          { currentAccount ? <RendorMintUI/> : <RenderNotConnected/> }
        </div>
				{ tokenId ? <p className="sub-text">{tokenId+1}/{TOTAL_MINT_COUNT} NFTs minted so far</p> : <p class="sub-text">No NFT Minted</p> }
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
