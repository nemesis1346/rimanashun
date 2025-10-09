import http from "http";
import url from "url";
// Use CommonJS-compatible entry for Node runtime to avoid JSON import assertions
import { vocabularyData, sentencePuzzles, categories } from "../../../packages/shared/index.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const sendJson = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
};

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  
  // Log all incoming requests
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}${query ? '?' + new URLSearchParams(query).toString() : ''}`);

  if (req.method === "GET" && pathname === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && pathname === "/v1/vocabulary") {
    console.log(`[${new Date().toISOString()}] Returning ${vocabularyData.length} vocabulary items`);
    return sendJson(res, 200, vocabularyData);
  }

  if (req.method === "GET" && pathname === "/v1/puzzles") {
    console.log(`[${new Date().toISOString()}] Returning ${sentencePuzzles.length} puzzle items`);
    return sendJson(res, 200, sentencePuzzles);
  }

  if (req.method === "GET" && pathname === "/v1/categories") {
    console.log(`[${new Date().toISOString()}] Returning ${categories.length} category items`);
    return sendJson(res, 200, categories);
  }

  if (req.method === "GET" && pathname === "/v1/vocabulary/by-category") {
    const category = (query.category || "").toString();
    if (!category) {
      console.log(`[${new Date().toISOString()}] No category filter, returning all ${vocabularyData.length} vocabulary items`);
      return sendJson(res, 200, vocabularyData);
    }
    const filtered = (vocabularyData || []).filter((w) => (w.category || "").toLowerCase() === category.toLowerCase());
    console.log(`[${new Date().toISOString()}] Filtering by category "${category}", returning ${filtered.length} items`);
    return sendJson(res, 200, filtered);
  }

  console.log(`[${new Date().toISOString()}] 404 - Not Found: ${req.method} ${pathname}`);
  sendJson(res, 404, { error: "Not Found" });
});

server.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});


