import {useEffect} from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json'


import {loadProvider, loadNetwork, loadAccount, loadTokens, loadExchange} from '../store/interaction'

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async() => {


    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)
    const account = await loadAccount(provider, dispatch)

    const DAPP = config[chainId]["TokenA"]
    const mETH = config[chainId]["mETH"]
    console.log(DAPP, mETH)
    await loadTokens(provider,[DAPP.address ,mETH.address] ,dispatch)

    const exchangeConfig = config[chainId]["Exchange"]
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

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