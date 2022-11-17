import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json'


import { loadProvider, loadNetwork, loadAccount, loadTokens, loadExchange, subscribeToEvent } from '../store/interaction'

import Navbar from "./Navbar"
import Markets from './Market';
import Balance from './Balance';

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async() => {

    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)
    const account = await loadAccount(provider, dispatch)

    window.ethereum.on("chainChanged", () => {
      window.location.reload()
    })

    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch)
    })

    const DAN = config[chainId]["DAN"]
    const mETH = config[chainId]["mETH"]

    await loadTokens(provider,[DAN.address ,mETH.address] ,dispatch)

    const exchangeConfig = config[chainId]["Exchange"]
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

    subscribeToEvent(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets/>

          <Balance/>

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