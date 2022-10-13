import '../App.css';
import {useEffect} from 'react';
import {ethers} from 'ethers';
import config from '../config.json'
import tokenJson from '../contracts/Token.sol/Token.json'
import exchangeJson from '../contracts/Exchange.sol/Exchange.json'

function App() {

  const loadBlockchainData = async() => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'})
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const network = await provider.getNetwork();

    const tokenA = new ethers.Contract(config[network.chainId]["TokenA"].address, tokenJson.abi, provider)
    const mDai = new ethers.Contract(config[network.chainId]["mDai"].address, tokenJson.abi, provider)
    const mETH = new ethers.Contract(config[network.chainId]["mETH"].address, tokenJson.abi, provider)
    const exchange = new ethers.Contract(config[network.chainId]["exchange"].address, exchangeJson.abi, provider)

  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;