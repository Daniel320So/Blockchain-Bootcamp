import { useEffect, useState, useRef} from 'react'
import { useSelector, useDispatch } from "react-redux"
import dapp from "../assets/dapp.svg"
import mETH from "../assets/eth.svg"

import { transferTokens, loadUserBalance } from "../store/interaction"

const Balance = () => {
    const dispatch = useDispatch();

    const provider = useSelector(state => state.provider.connection)
    const account = useSelector(state => state.provider.account)

    const exchange = useSelector(state => state.exchange.contract)
    const exchangeBalances = useSelector(state => state.exchange.balances)
    const transferInProgress = useSelector(state => state.exchange.transferInProgress)

    const balances = useSelector(state => state.tokens.balances)
    const symbols = useSelector(state => state.tokens.symbols)
    const tokens = useSelector(state => state.tokens.contracts)

    useEffect(() => {
        if (exchange && tokens[0] && tokens[1] && account) {
            loadUserBalance(exchange, tokens, account, dispatch)
        }
    }, [exchange, tokens, account, transferInProgress])

    const amountHandler = async(e, token) => {
        if (token.address === tokens[0].address) {
            setToken1Amount(e.target.value)
        } else if (token.address === tokens[1].address) {
            setToken2Amount(e.target.value)
        }
    }

    //Step 1: do deposit
    //Step 2: Notify App that deposit is pending
    //Step 3: Get confirmation when the transfer is successful
    //Step 4: Notify App that trnasfer was successful
    //Step 5: Handler transfer fail

    const depositHandler = (e, token) => {
        e.preventDefault()
        if (token.address === tokens[0].address) {
            transferTokens(provider, exchange, "Deposit", token, token1Amount, dispatch)
            setToken1Amount(0)
        } else if (token.address === tokens[1].address) {
            transferTokens(provider, exchange, "Deposit", token, token2Amount, dispatch)
            setToken2Amount(0)
        }
    }

    const withdrawHandler = (e, token) => {
        e.preventDefault()
        if (token.address === tokens[0].address) {
            transferTokens(provider, exchange, "Withdraw", token, token1Amount, dispatch)
            setToken1Amount(0)
        } else if (token.address === tokens[1].address) {
            transferTokens(provider, exchange, "Withdraw", token, token2Amount, dispatch)
            setToken2Amount(0)
        }
    }

    const depositRef = useRef(null)
    const withdrawRef = useRef(null)

    const tabHandler = (e) => {
        if(e.target.className !== depositRef.current.className) {
            depositRef.current.className = "tab"
            setIsDeposit(false)
        } else {
            withdrawRef.current.className = "tab"
            setIsDeposit(true)
        }
        e.target.className = "tab tab--active"
    }

    const [isDeposit, setIsDeposit] = useState(true)
    const [token1Amount, setToken1Amount] = useState(0);
    const [token2Amount, setToken2Amount] = useState(0);

    return (
      <div className='component exchange__transfers'>
        
        <hr />

        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button className='tab tab--active' onClick={tabHandler} ref={depositRef}>Deposit</button>
            <button className='tab' onClick={tabHandler} ref={withdrawRef}>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={dapp} alt="Token Logo"/>{symbols && symbols[0]}</p>
            <p><small>Wallet</small><br />{balances && balances[0]}</p>
            <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
          </div>
  
          <form onSubmit={(e)=>isDeposit? depositHandler(e, tokens[0]): withdrawHandler(e, tokens[0])}>
            <label htmlFor="token0">{symbols && symbols[0]}</label>
            <input 
                type="text" 
                id='token0' 
                placeholder='0.0000' 
                value = {token1Amount === 0 ? "" : token1Amount}
                onChange={(e) => amountHandler(e, tokens[0])} />
  
            <button className='button' type='submit'>
                {isDeposit? (
                    <span>Deposit</span>
                ): (
                    <span>Withdraw</span>
                )}
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
          <p><small>Token</small><br /><img src={mETH} alt="Token Logo"/>{symbols && symbols[1]}</p>
            <p><small>Wallet</small><br />{balances && balances[1]}</p>
            <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[1]}</p>
          </div>
  
          <form onSubmit={(e)=>isDeposit? depositHandler(e, tokens[1]): withdrawHandler(e, tokens[1])}>
            <label htmlFor="token1"></label>
            <input 
                type="text"
                id='token1'
                placeholder='0.0000'
                value={token2Amount === 0 ? "" : token2Amount}
                onChange={(e) => amountHandler(e, tokens[1])} 
            />
            <button className='button' type='submit'>
                {isDeposit? (
                    <span>Deposit</span>
                ): (
                    <span>Withdraw</span>
                )}
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;