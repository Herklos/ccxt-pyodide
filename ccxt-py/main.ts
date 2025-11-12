import { loadPyodide } from "npm:pyodide/pyodide.mjs";

// Install ccxt dependencies
const pyodide = await loadPyodide({
  packages: ["numpy", "micropip", "cryptography", "requests", "ssl", "aiohttp"],
});

// Install ccxt with dependencies
await pyodide.runPythonAsync(`
  import micropip
  await micropip.install("ccxt", deps=False)
`);

// Try to use ccxt
const result = await pyodide.runPythonAsync(`
  import json
  import time
  import asyncio
  
  async def _fetch_ohlcv_async(exchange_name, symbol, timeframe, limit, async_ccxt=False):
    """
    Fetch OHLCV data for a single symbol from an exchange.
    
    Args:
        exchange_name: Name of the exchange (e.g., 'binance', 'coinbase')
        symbol: Trading pair symbol (e.g., 'BTC/USDT')
        timeframe: Timeframe for the data (e.g., '1h', '1d')
        limit: Number of candles to fetch
    
    Returns:
        JSON string containing timing result
    """

    if async_ccxt:
      import ccxt.async_support as ccxt
    else:
      import ccxt

    try:
        # Initialize the exchange
        exchange_class = getattr(ccxt, exchange_name.lower())
        exchange = exchange_class({
            'enableRateLimit': True,
        })
        
        # Measure time for fetch_ohlcv
        start_time = time.time()
        if async_ccxt:
            await exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
        else:
            exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
        end_time = time.time()
        
        # Calculate elapsed time
        elapsed_time = end_time - start_time
        
        # Return timing result
        result = {
            f'{timeframe} elapsed time': elapsed_time
        }
        
        return json.dumps(result)
    except Exception as e:
        error_msg = f"Error fetching OHLCV: {str(e)}"
        print(error_msg)
        raise Exception(error_msg)
    
  async def _fetch_ohlcv_async_all(exchange_name, symbol, limit, async_ccxt=False):
    return await asyncio.gather(
        _fetch_ohlcv_async(exchange_name, symbol, "1h", limit, async_ccxt), 
        _fetch_ohlcv_async(exchange_name, symbol, "4h", limit, async_ccxt), 
        _fetch_ohlcv_async(exchange_name, symbol, "1d", limit, async_ccxt)
    )

  json.dumps(asyncio.run(_fetch_ohlcv_async_all("binance", "BTC/USDT", 100, False),debug=False))
`);

console.log(result);
