from workers import Response, WorkerEntrypoint
from submodule import get_ohlcv

class Default(WorkerEntrypoint):
    async def fetch(self, request):
        result = await get_ohlcv("kucoin", "BTC/USDT", 100, True)
        return Response(result)
