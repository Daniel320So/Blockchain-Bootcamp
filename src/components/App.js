import {useEffect} from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json'


import {loadProvider, loadNetwork, loadAccount, loadToken} from '../store/interaction'

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async() => {

    const account = await loadAccount(dispatch)
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

 
    const tokenA = await loadToken(provider, config[chainId]["TokenA"], dispatch)
    const mDai = await loadToken(provider, config[chainId]["mDai"], dispatch)
    const mETH = await loadToken(provider, config[chainId]["mETH"], dispatch)
    // const exchange = await loadToken(provider, config[chainId]["exchange"], dispatch)


    
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