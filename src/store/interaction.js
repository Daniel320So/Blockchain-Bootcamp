import { ethers } from "ethers";
import tokenJson from '../contracts/Token.sol/Token.json'
import exchangeJson from '../contracts/Exchange.sol/Exchange.json'
import { TransactionDescription } from "ethers/lib/utils";
import { exchange } from "./reducers";

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
    let token, symbol;
    token = new ethers.Contract(addresses[0], tokenJson.abi, provider);
    symbol = await token.symbol();
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

export const subscribeToEvent = (exchange, dispatch) => {
    exchange.on("DepositToken", (event) => {
        dispatch({type: "TRANSFER_SUCCESS", event})
    })
    exchange.on("WithdrawToken", (event) => {
        dispatch({type: "TRANSFER_SUCCESS", event})
    })
}

export const loadUserBalance = async(exchange, tokens, account, dispatch) => {
    let balance = await tokens[0].balanceOf(account)
    balance = Number(ethers.utils.formatUnits(balance, 18))
    dispatch({type:"TOKEN_1_BALANCE_LOADED", balance});

    balance = await exchange.userBalance(tokens[0].address, account)
    balance = Number(ethers.utils.formatUnits(balance, 18))
    dispatch({type:"EXCHANGE_TOKEN_1_BALANCE_LOADED", balance});

    balance = await tokens[1].balanceOf(account)
    balance = Number(ethers.utils.formatUnits(balance, 18))
    dispatch({type:"TOKEN_2_BALANCE_LOADED", balance});

    balance = await exchange.userBalance(tokens[1].address, account)
    balance = Number(ethers.utils.formatUnits(balance, 18))
    dispatch({type:"EXCHANGE_TOKEN_2_BALANCE_LOADED", balance});
}

export const transferTokens = async(provider, exchange, transferType, token, amount, dispatch) => {
    let transaction
    const signer = provider.getSigner()
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)
    dispatch({type:"TRANSFER_REQUEST"})
    if (transferType === "Deposit") {
        try {
            transaction = await token.connect(signer).approve(exchange.address, amountToTransfer);
            await transaction.wait()
            transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer);
            await transaction.wait()
        } catch(err) {
            dispatch({type:"TRANSFER_FAILED"})
        }
        return transaction
    } else if (transferType === "Withdraw") {
        try {
            transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer);
            await transaction.wait()
        } catch(err) {
            dispatch({type:"TRANSFER_FAILED"})
        }
    }
}