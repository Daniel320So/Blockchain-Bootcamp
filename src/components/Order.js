import { useEffect, useState, useRef} from 'react'
import { useSelector, useDispatch } from "react-redux"
import dapp from "../assets/dapp.svg"
import mETH from "../assets/eth.svg"

import { makeOrder, loadUserBalance } from "../store/interaction"

const Order = () => {

    const dispatch = useDispatch();

    const provider = useSelector(state => state.provider.connection)
    const account = useSelector(state => state.provider.account)

    const exchange = useSelector(state => state.exchange.contract)
    const transferInProgress = useSelector(state => state.exchange.transferInProgress)

    const symbols = useSelector(state => state.tokens.symbols)
    const tokens = useSelector(state => state.tokens.contracts)

    const buyRef = useRef(null)
    const sellRef = useRef(null)

    const tabHandler = (e) => {
        if (e.target.className !== buyRef.current.className){
            buyRef.current.className = "tab"
            setIsBuy(false)
        } else {
            sellRef.current.className = "tab"
            setIsBuy(true)
        }
        e.target.className = "tab tab--active"
    }

    const [isBuy, setIsBuy] = useState(true)
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)

    const amountHandler = (e) => {
        setAmount(e.target.value)
    }

    const priceHandler = (e) => {
        setPrice(e.target.value)
    }

    const submitHandler =(e, type) => {
        e.preventDefault()
        makeOrder(provider, exchange, type, tokens[0], tokens[1], amount, price, dispatch)
        setAmount(0)
        setPrice(0)
    }

    return (
      <div className="component exchange__orders">
        <div className='component__header flex-between'>
          <h2>New Order</h2>
          <div className='tabs'>
            <button className='tab tab--active' ref={buyRef} onClick={tabHandler}>Buy</button>
            <button className='tab' ref={sellRef} onClick={tabHandler}>Sell</button>
          </div>
        </div>
  
        <form>
          <label htmlFor="amount">Amount</label>
          <input 
            type="text" 
            id='amount' 
            placeholder='0.0000'                 
            value={amount === 0 ? "" : amount}
            onChange={(e) => amountHandler(e)} 
          />
          <label htmlFor="price">Price</label>
          <input 
            type="text" 
            id='price' 
            placeholder='0.0000'                 
            value={price === 0 ? "" : price}
            onChange={(e) => priceHandler(e)} 
          />
          {isBuy? (
            <button className='button button--filled' type='submit' onClickCapture={(e) => submitHandler(e, "Buy")}>
                Buy
            </button>
          ) : ( 
            <button className='button button--filled' type='submit' onClickCapture={(e) => submitHandler(e, "Sell")}>
                Sell
            </button>
          )}
          </form>
      </div>
    );
  }
  
  export default Order;