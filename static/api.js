async function getAllNodes() {
  const response = await fetch("/getnodes");
  const json = await response.json();
  return json;
}

async function getAllRelations() {
  const response = await fetch("/getrelations");
  const json = await response.json();
  return json;
}

async function createNode(name, x, y, color) {
  const payload = { name, x, y, color };
  const response = await fetch("/createnode", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
  const { id } = await response.json();
  return id;
}

async function createRelation(startId, endId, oriented, weight) {
  const payload = { start_id: startId, end_id: endId, oriented, weight };
  const response = await fetch("/createrelation", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  return text;
}

async function updateNode(id, name, x, y, color) {
  const payload = { name, x, y, color };
  const response = await fetch(`/updatenode/${id}`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  return text;
}

async function updateRelation(startId, endId, oriented, weight) {
  const payload = { oriented, weight };
  const response = await fetch(`/updaterelation/${startId}/${endId}`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  return text;
}

async function deleteNode(id) {
  const response = await fetch(`/deletenode/${id}`);
  const text = await response.text();
  return text;
}

async function deleteRelation(id) {
  const response = await fetch(`/deleterelation/${id}`);
  const text = await response.text();
  return text;
}
