/**
 * Récupère la liste des noeuds
 * @returns {Promise<Array<{color: string, id: number, name: string, x: number, y: number}>>} La liste des noeuds
 * @async
 */
async function getAllNodes() {
  const response = await get("/getnodes");
  return await response.json();
}

/**
 * Récupère la liste des relations
 * @returns {Promise<Array<{start_id: number, end_id: number, oriented: boolean, weight: 1}>>} La liste des relations
 * @async
 */
async function getAllRelations() {
  const response = await get("/getrelations");
  return await response.json();
}

/**
 * Crée un nouveau noeud
 * @param {string} name Le nom du noeud
 * @param {string} x L'abscisse du noeud
 * @param {number} y L'ordonnée du noeud
 * @param {string} color La couleur du noeud en héxadécimal
 * @returns {Promise<string>} L'id du nouveau noeud
 * @async
 */
async function createNode(name, x, y, color) {
  const payload = { name, x, y, color };
  const response = await post("/createnode", payload);
  return (await response.json()).id;
}

/**
 * Crée une nouvelle relation
 * @param {number} startId Le noeud de départ
 * @param {number} endId Le noeud d'arrivée
 * @param {boolean} oriented Si le relation est orientée
 * @param {number} weight Le poids de la relation
 * @returns {Promise<string>} "ok" dans tous les cas
 * @async
 */
async function createRelation(startId, endId, oriented, weight) {
  const payload = { start_id: startId, end_id: endId, oriented, weight };
  const response = await post("/createrelation", payload);
  return await response.text();
}

/**
 * Met à jour un noeud. La requête contient tous les champs,
 * mais les valeurs non modifiées lors d'une modification seront
 * renvoyées à l'identique.
 * @param {number} id L'id du noeud
 * @param {string} name Le nouveau nom du noeud
 * @param {number} x La nouvelle abscisse
 * @param {number} y La nouvelle ordonée
 * @param {string} color La nouvelle couleur
 * @returns {Promise<string>} "ok" dans tous les cas
 * @async
 */
async function updateNode(id, name, x, y, color) {
  const payload = { name, x, y, color };
  const response = await post(`/updatenode/${id}`, payload);
  return await response.text();
}

/**
 * Met à jour une relation. La requête contient tous les champs,
 * mais les valeurs non modifiées lors d'une modification seront
 * renvoyées à l'identique.
 * @param {number} startId L'id du noeud de départ
 * @param {number} endId L'id du noeud d'arrivée
 * @param {boolean} oriented Si la relation est orientée
 * @param {number} weight Le poids de la relation
 * @returns {Promise<string>} "ok" dans tous les cas
 * @async
 */
async function updateRelation(startId, endId, oriented, weight) {
  const payload = { oriented, weight };
  const response = await fetch(`/updaterelation/${startId}/${endId}`, payload);
  return await response.text();
}

/**
 * Supprime un noeud
 * @param {string} id L'id du noeud
 * @returns {Promise<string>} "ok" dans tous les cas
 * @async
 */
async function deleteNode(id) {
  const response = await post(`/deletenode/${id}`, {});
  return await response.text();
}

/**
 * Supprime une relation
 * @param {number} startId Le noeud de départ
 * @param {number} endId Le noeud d'arrivée
 * @returns {Promise<string>} "ok" dans tous les cas
 * @async
 */
async function deleteRelation(startId, endId) {
  const response = await post(`/deleterelation/${startId}/${endId}`, {});
  return await response.text();
}

/**
 * Récupère le parcours en largueur du graphe
 * à partir d'un noeud donnée
 * @param {number} startId L'id du noeud de départ
 * @returns {Promise<Array<number>>} La liste des noeuds du parcours dans l'ordre
 * @async
 */
async function breadthFirstSearch(startId) {
  const response = await get(`/bfs/${startId}`);
  return await response.json();
}

/**
 * Récupère le parcours en profondeur du graphe
 * à partir d'un noeud donnée
 * @param {number} startId L'id du noeud de départ
 * @returns {Promise<Array<number>>} La liste des noeuds du parcours dans l'ordre
 * @async
 */
async function depthFirstSearch(startId) {
  const response = await get(`/dfs/${startId}`);
  return await response.json();
}

/**
 * Récupère le chemin le plus cours entre deux noeuds donnés
 * du graphe selon l'algorithme de Dijkstra
 * @param {number} startId L'id du noeud de départ
 * @param {number} endId L'id du noeud d'arrivée
 * @returns {Promise<Array<number>>} Le chemin du graphe correspond au chemin le plus court
 * @async
 */
async function dijkstraAlgo(startId, endId) {
  const response = await get(`/dijkstra/${startId}/${endId}`);
  return await response.json();
}

/**
 * Importe une matrice d'adjacence
 * @param {Array<string>} names Le nom de noeuds (l'ordre compte)
 * @param {string} text Le texte contenant la matrice
 * @param {number} x L'abscisse initiale des noeuds
 * @param {number} y L'ordonnée initiale des noeuds
 * @returns {Promise<string>} "ok" dans tous les cas
 * @async
 */
async function importMatrix(names, text, x, y) {
  const payload = { names, text, x, y };
  const response = await post(`/import/matrix`, payload);
  return await response.text();
}

/**
 * Effectue une requête http GET
 * @param {string} url L'URL de destination
 * @returns {Promise<Object>} La réponse de la requête
 * @async
 */
async function get(url) {
  return await fetch(url);
}

/**
 * Effectue une requête http POST
 * @param {string} url L'URL de destination
 * @param {Object} payload Le corps de la requête
 * @returns {Promise<Object>} La réponse de la requête
 * @async
 */
async function post(url, payload) {
  return await fetch(url, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  });
}
