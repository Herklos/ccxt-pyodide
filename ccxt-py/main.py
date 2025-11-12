import json
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

async def _fetch_ohlcv_async(exchange, symbol, timeframe, limit, async_ccxt=False):
  try:
      print(f"Fetching OHLCV for {exchange.id} {symbol} {timeframe} {limit}...")
      # Measure time for fetch_ohlcv
      start_time = time.time()
      if async_ccxt:
          await exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
      else:
          # Run the synchronous fetch_ohlcv in a thread executor
          loop = asyncio.get_event_loop()
          fetch_func = partial(exchange.fetch_ohlcv, symbol, timeframe, limit=limit)
          await loop.run_in_executor(_thread_executor, fetch_func)
      end_time = time.time()
      
      # Calculate elapsed time
      elapsed_time = end_time - start_time
      
      # Return timing result
      result = {
          f'{timeframe} elapsed time': elapsed_time
      }
      print(f"Fetched OHLCV for {exchange.id} {symbol} {timeframe} {limit} in {elapsed_time} seconds")
      
      return json.dumps(result)
  except Exception as e:
      error_msg = f"Error fetching OHLCV: {str(e)}"
      print(error_msg)
      raise Exception(error_msg)
  
# Create a thread executor for running synchronous code
_thread_executor = ThreadPoolExecutor(max_workers=3)

async def _fetch_ohlcv_async_all(exchange_name, symbol, limit, async_ccxt=False):
  if async_ccxt:
    import ccxt.async_support as ccxt
  else:
    import ccxt

  # Initialize the exchange
  exchange_class = getattr(ccxt, exchange_name.lower())
  exchange = exchange_class({
        'enableRateLimit': True,
    })

  return await asyncio.gather(
      _fetch_ohlcv_async(exchange, symbol, "1h", limit, async_ccxt), 
      _fetch_ohlcv_async(exchange, symbol, "4h", limit, async_ccxt), 
      _fetch_ohlcv_async(exchange, symbol, "1d", limit, async_ccxt)
  )

exchange_name = globals().get("exchange_name", "kucoin")
print(f"Fetching OHLCV for exchange: {exchange_name}")
json.dumps(asyncio.run(_fetch_ohlcv_async_all(exchange_name, "BTC/USDT", 100, False),debug=False))

