import { ethers } from "ethers";
import tokenJson from '../contracts/Token.sol/Token.json'

export const loadProvider = (dispatch) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({type:"PROVIDER_LOADED", connection:provider})
    return provider;
}

export const loadNetwork = async(provider, dispatch) => {
    const {chainId} = await provider.getNetwork()
    dispatch({type:"NETWORK_LOADED", chainId})
    return chainId;
}

export const loadAccount = async(dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'})
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({type:"ACCOUNT_LOADED", account})
    return account
}

export const loadToken = async(provider, address, dispatch) => {
    let token, symbol
    token = new ethers.Contract(address, tokenJson.abi, provider)
    symbol = await token.symbol();
    dispatch({type:"TOKEN_LOADED", token, symbol})
    return token
}