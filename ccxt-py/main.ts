import { loadPyodide } from "npm:pyodide/pyodide.mjs";
import pythonCode from "./main.py" with { type: "text" };

async function executeCode(exchangeName: string) {
  // Install ccxt dependencies
  const pyodide = await loadPyodide({
    // indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/",
    packages: ["numpy", "micropip", "cryptography", "requests", "ssl", "aiohttp"],
  });

  // Install ccxt with dependencies
  await pyodide.runPythonAsync(`
    import micropip
    await micropip.install("pyodide-http")
    await micropip.install("ccxt", deps=False)
  `);

  // Set the exchange name as a global variable in Python
  pyodide.globals.set("exchange_name", exchangeName);

  const result = await pyodide.runPythonAsync(pythonCode);

  return result;
}

// HTTP server handler
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // Only handle GET requests
  if (req.method === "GET") {
    // Extract exchange name from path: "/" or "/{exchange_name}"
    // Default to "kucoin" if path is "/"
    let exchangeName = "kucoin";
    const pathParts = url.pathname.split("/").filter(part => part.length > 0);
    
    if (pathParts.length > 0) {
      exchangeName = pathParts[0].toLowerCase();
    }
    
    try {
      const result = await executeCode(exchangeName);
      return new Response(result, {
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(`Error: ${errorMessage}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }
  
  // Return 404 for other methods
  return new Response("Not Found", { status: 404 });
}

// Start the server
const port = 8000;
console.log(`Server running on http://localhost:${port}/`);
Deno.serve({ port }, handler);
