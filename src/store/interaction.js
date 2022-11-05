import { ethers } from "ethers";
import tokenJson from '../contracts/Token.sol/Token.json'
import exchangeJson from '../contracts/Exchange.sol/Exchange.json'

export const loadProvider = (dispatch) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({type:"PROVIDER_LOADED", connection:provider})
    return provider;
}

export const loadNetwork = async(provider, dispatch) => {
    const {chainId} = await provider.getNetwork();
    dispatch({type:"NETWORK_LOADED", chainId});
    return chainId;
}

export const loadAccount = async(provider, dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
    const account = ethers.utils.getAddress(accounts[0]);
    dispatch({type:"ACCOUNT_LOADED", account});

    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance)
    dispatch({type:"ETHER_BALANCE_LOADED", balance})
    return account;
}

export const loadTokens = async(provider, addresses, dispatch) => {
    console.log("load Tokens", addresses[0], tokenJson.abi, provider)
    let token, symbol;
    token = new ethers.Contract(addresses[0], tokenJson.abi, provider);
    console.log("load Tokens", token)
    symbol = await token.symbol();
    console.log(token, symbol)
    dispatch({type:"TOKEN_1_LOADED", token, symbol});
    token = new ethers.Contract(addresses[1], tokenJson.abi, provider);
    symbol = await token.symbol();
    dispatch({type:"TOKEN_2_LOADED", token, symbol});
    return token;
}

export const loadExchange = async(provider, address, dispatch) => {
    let exchange = new ethers.Contract(address, exchangeJson.abi, provider);
    dispatch({type:"EXCHANGE_LOADED", exchange});
    return exchange;
}