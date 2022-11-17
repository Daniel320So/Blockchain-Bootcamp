import { useSelector, useDispatch } from "react-redux";
import Blockies from "react-blockies";

import logo from "../assets/logo.png"
import eth from "../assets/eth.svg"
import config from "../config.json"

import { loadAccount, loadNetwork} from "../store/interaction"
const Navbar = () => {

    const dispatch = useDispatch()
    const provider = useSelector(state => state.provider)
    const chainId = provider.chainId
    const account = provider.account
    const balance = provider.balance
    const trunAccount = account? account.slice(0,5) + "..." + account.slice(38,42) : ""
    const roundedBalance = balance? Number(balance).toFixed(2): 0

    const connectHandler = async() => {
        await loadAccount(provider, dispatch)
    }
    const networkHandler = async(event) => {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{chainId: event.target.value}]
        })
    }
    return (
        <div className="exchange__header grid">
            <div className="exchange__header--brand flex">
                <img src={logo} className ="logo" alt="Dapp Logo"></img>
                <h1>Token Exchange (Order Book)</h1>
            </div>
            <div className="exchange__header--networks flex">
                <img src={eth} alt="ETH Logo" className="Eth Logo" />
                {chainId && (
                    <select name="networks" id="networks" value={ config[chainId]? `0x${chainId.toString(16)}`: `0`} onChange={networkHandler}>
                        <option value="0" disabled>Select Network</option> 
                        <option value="0x61">BSC Testnet</option>
                    </select>
                )}

            </div>

            <div className="exchange__header--account flex">
                <p><small>My Balance</small> {roundedBalance} ETH</p>
                {account ? (
                    <a href={`https://kovan.etherscan.io/address/${account}`} target="_blank" rel="noreferrer">
                        {trunAccount} 
                        <Blockies
                            seed={account}
                            size={10}
                            scale={3}
                            color="#2187D0"
                            bgColor="767F92"
                            spotColor="767F92"
                            className="identicon"
                        />
                    </a>
                ) : (
                    <button className="button" onClick={connectHandler}>Connect</button>
                )}

            </div>

        </div>
    )
}

export default Navbar;