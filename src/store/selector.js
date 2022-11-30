import { ethers } from "ethers";
import { get, groupBy, reject } from "lodash";
import {createSelector} from "reselect";
import moment from "moment";


const tokens = state => get(state, "tokens.contracts")
const allOrders = state => get(state, "exchange.allOrders.data", [])
const cancelledOrders = state => get(state, "exchange.cancelledOrders.data", [])
const filledOrders = state => get(state, "exchange.filledOrders.data", [])

const openOrders = state => {
    const all = allOrders(state)
    const cancelled = cancelledOrders(state)
    const filled = filledOrders(state)

    const openOrders = reject(all, v => {
        const orderFilled = filled.some( o => {
            return o._id.toString() === v._id.toString()
        })
        const orderCancelled = cancelled.some( o => {
            return o._id.toString() === v._id.toString()
        })
        return orderFilled || orderCancelled
    })

    return openOrders
}
const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount;

    if(order.tokenGive === tokens[1].address ) {
        token0Amount = order._amountGive
        token1Amount = order._amountGet
    } else {
        token1Amount = order._amountGive
        token0Amount = order._amountGet
    }

    return({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
        token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
        tokenPrice: Math.round(token1Amount/token0Amount*100000) / 100000,
        formattedTimestamp: moment.unix(order._timestamp).format("hh:mm:ssa d MMM D")
    })
}

export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {
    if (!tokens || !tokens[0] || !tokens[1] || orders.length == 0) return
    orders = orders.filter( o => o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address)
    orders = orders.filter( o => o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address)
    orders = decorateOrderBookOrders(orders, tokens)
    orders = groupBy(orders, "orderType")
    orders.buy = orders.buy ? orders.buy.sort((a, b) => b.tokenPrice - a.tokenPrice) : []
    orders.sell = orders.sell ? orders.sell.sort((a, b) => b.tokenPrice - a.tokenPrice) : []
    return orders
})


const GREEN = "#25CE8F"
const RED = "#F45353"

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order._tokenGive === tokens[1].address ? "buy" : "sell"
    return ({
        ...order,
        orderType,
        orderTypeClass: (orderType === "buy" ? GREEN : RED),
        orderFillAction: (orderType === "buy" ? "sell" : "buy")
    })
}

const decorateOrderBookOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return order
        })
    )
}
