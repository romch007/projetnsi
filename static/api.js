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
