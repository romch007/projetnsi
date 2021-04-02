async function getAllNodes() {
  const response = await get("/getnodes");
  return await response.json();
}

async function getAllRelations() {
  const response = await get("/getrelations");
  return await response.json();
}

async function createNode(name, x, y, color) {
  const payload = { name, x, y, color };
  const response = await post("/createnode", payload);
  return (await response.json()).id;
}

async function createRelation(startId, endId, oriented, weight) {
  const payload = { start_id: startId, end_id: endId, oriented, weight };
  const response = await post("/createrelation", payload);
  return await response.text();
}

async function updateNode(id, name, x, y, color) {
  const payload = { name, x, y, color };
  const response = await post(`/updatenode/${id}`, payload);
  return await response.text();
}

async function updateRelation(startId, endId, oriented, weight) {
  const payload = { oriented, weight };
  const response = await fetch(`/updaterelation/${startId}/${endId}`, payload);
  return await response.text();
}

async function deleteNode(id) {
  const response = await post(`/deletenode/${id}`, {});
  return await response.text();
}

async function deleteRelation(startId, endId) {
  const response = await post(`/deleterelation/${startId}/${endId}`, {});
  return await response.text();
}

async function breadthFirstSearch(startId) {
  const response = await get(`/bfs/${startId}`);
  return await response.json();
}

async function depthFirstSearch(startId) {
  const response = await get(`/dfs/${startId}`);
  return await response.json();
}

async function dijkstraAlgo(startId, endId) {
  const response = await get(`/dijkstra/${startId}/${endId}`);
  return await response.json();
}

async function importMatrix(names, text) {
  const payload = { names, text };
  const response = await post(`/import/matrix`, payload);
  return await response.text();
}

async function get(url) {
  return await fetch(url);
}

async function post(url, payload) {
  return await fetch(url, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
}