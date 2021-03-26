async function getAllNodes() {
  const response = await fetch("/getnodes");
  return await response.json();
}

async function getAllRelations() {
  const response = await fetch("/getrelations");
  return await response.json();
}

async function createNode(name, x, y, color) {
  const payload = { name, x, y, color };
  const response = await fetch("/createnode", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
  return (await response.json()).id;
}

async function createRelation(startId, endId, oriented, weight) {
  const payload = { start_id: startId, end_id: endId, oriented, weight };
  const response = await fetch("/createrelation", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
  return await response.text();
}

async function updateNode(id, name, x, y, color) {
  const payload = { name, x, y, color };
  const response = await fetch(`/updatenode/${id}`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
  return await response.text();
}

async function updateRelation(startId, endId, oriented, weight) {
  const payload = { oriented, weight };
  const response = await fetch(`/updaterelation/${startId}/${endId}`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
  return await response.text();
}

async function deleteNode(id) {
  const response = await fetch(`/deletenode/${id}`, { method: "POST" });
  return await response.text();
}

async function deleteRelation(startId, endId) {
  const response = await fetch(`/deleterelation/${startId}/${endId}`, {
    method: "POST"
  });
  return await response.text();
}

async function breadthFirstSearch(startId, endId) {
  const response = await fetch(`/bfs/${startId}/${endId}`);
  return await response.json();
}
