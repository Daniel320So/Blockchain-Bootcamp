import { useSelector, useDispatch } from "react-redux";
import config from "../config.json"

import { loadTokens } from "../store/interaction"

const Markets = () => {
    const dispatch = useDispatch();
    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId)

    const marketHandler = async(e) => {
        loadTokens(provider, e.target.value.split(","), dispatch)
    }

    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Market</h2>
        </div>

        {chainId && config[chainId]? (
        <select name="markets" id="markets" onChange={marketHandler}>
            <option value={`${config[chainId].DAN.address},${config[chainId].mETH.address}`} >DAN / mETH</option> 
            <option value={`${config[chainId].DAN.address},${config[chainId].mDai.address}`} >DAN / mDai</option> 
        </select>
        ) : (
            <div>
                <p>Not Deployed to Network</p>
            </div>
        )}
      </div>
    )
  }
  
  export default Markets;