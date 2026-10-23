/**
 * Netlify Function — GET /api/get-cmd
 * Retorna o comando atual e limpa após leitura (one-shot)
 */

// Senha de admin — mude aqui
const ADMIN_PASS = "27112025";

// Storage em memória (persiste entre invocações na mesma instância)
// Para persistência real, use KV store ou JSONBin
let currentCommand = "";
let commandTimestamp = 0;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "text/plain",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // GET — PowerShell busca o comando
  if (event.httpMethod === "GET") {
    const cmd = currentCommand;
    // Limpa após leitura (one-shot)
    currentCommand = "";
    return { statusCode: 200, headers, body: cmd };
  }

  // POST — painel envia novo comando
  if (event.httpMethod === "POST") {
    const pass = event.headers["x-admin-password"] || "";
    if (pass !== ADMIN_PASS) {
      return { statusCode: 401, headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Não autorizado" }) };
    }
    const body = JSON.parse(event.body || "{}");
    currentCommand = body.command || "";
    commandTimestamp = Date.now();
    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, command: currentCommand })
    };
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};
