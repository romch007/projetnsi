/**
 * Crée un noeud (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolCreateNode(event) {
  // On récupère les coordonnées de la souris au moment du clique
  const x = event.evt.layerX;
  const y = event.evt.layerY;

  // On demande à l'utilisateur le nom du noeud
  const name = prompt("Nom du noeud ?");
  if (name) {
    const args = [name, x, y, nodeColorPicker.value];
    // On envoie une requête pour créer le noeud
    createNode(...args).then(id => {
      // Une fois la réponse reçue on déssine le noeud
      drawNodeCircle(id, ...args);
      layer.draw();
    });
  }
}

/**
 * Redimensionne tous les noeuds
 * @param {number} radius Le nouveau rayon
 */
function resizeNodes(newRadius) {
  radius = newRadius;
  // Pour chaque noeud on change le rayon du cercle
  for (const node of nodes.values()) {
    node.children[0].radius(newRadius);
  }
  stage.draw();
}

/**
 * Crée une relation (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolCreateRelation(event) {
  if (relationStep === "first") {
    // Si l'utilisateur est en train de sélection le premier noeud
    // On récupère l'id du noeud cliqué
    startNodeId = getGroupIdFromEvent(event);
    // On met en surbriance le noeud cliqué
    highlightNodeById(startNodeId);
    // On attend que l'utilisateur clique sur le second noeud
    relationStep = "second";
  } else {
    // Si l'utilisateur est en train de sélection le second noeud
    // On récupère l'id du noeud cliqué
    const endId = getGroupIdFromEvent(event);
    // On met en surbriance le noeud cliqué
    highlightNodeById(endId);
    if (startNodeId != endId && !relationAlreadyExists([startNodeId, endId])) {
      // On vérifie que les deux noeuds ne sont pas les mêmes et que la relation n'existe pas déjà
      let weight = 1;
      if (weightedCheckBox.checked) {
        // Si la case Pondérée est cochée on demande à l'utilisateur le poids de la relation
        weight = Number(prompt("Poids ?"));
      }
      const args = [startNodeId, endId, orientedCheckBox.checked, weight];
      // On envoie une requête pour créer la relation
      createRelation(...args).then(() => {
        // Une fois la réponse reçue on dessine la relation
        drawRelation(...args);
        layer.draw();
      });
    }
    // On enlève la surbriance des deux noeuds
    resetHighlight([startNodeId, endId]);
    // On attend que l'utilisteur sélectionne le premier noeud (état de base)
    relationStep = "first";
  }
}

/**
 * Modifie un noeud (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolEditNode(event) {
  // On récupère l'id du noeud cliqué
  const nodeId = getGroupIdFromEvent(event);
  // On demande à l'utilisateur le nom du noeud
  const newName = prompt("Nouveau nom ?");
  // On récupère l'objet Konva
  const clickedGroup = nodes.get(nodeId);
  if (clickedGroup && newName) {
    // On envoie une requête
    updateNode(
      nodeId,
      newName,
      clickedGroup.x(),
      clickedGroup.y(),
      "grey"
    ).then(() => {
      // On dessine le noeud en changeant son nom
      clickedGroup.children[1].text(newName);
      layer.draw();
    });
  }
}

/**
 * Supprime un noeud (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolDeleteNode(event) {
  // On récupère l'id du noeud cliqué
  const id = getGroupIdFromEvent(event);
  const group = nodes.get(id);
  if (group) {
    // On envoie une requête
    deleteNode(id).then(() => {
      // On supprime le noeud
      nodes.delete(id);
      group.remove();
      // On supprime les relations dont le noeud fait parti
      deleteRelationsRelatedTo(id);
      layer.draw();
    });
  }
}

/**
 * Supprime une relation (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolDeleteRelation(event) {
  if (relationStep === "first") {
    // Si l'utilisateur est en train de sélection le premier noeud
    // On récupère l'id du noeud cliqué
    startNodeId = getGroupIdFromEvent(event);
    // On met en surbriance le noeud cliqué
    highlightNodeById(startNodeId);
    // On attend que l'utilisateur clique sur le second noeud
    relationStep = "second";
  } else {
    // Si l'utilisateur est en train de sélection le second noeud
    // On récupère l'id du noeud cliqué
    const endId = getGroupIdFromEvent(event);
    // On met en surbriance le noeud cliqué
    highlightNodeById(endId);
    // On récupère la relation
    const foundRelation = relationAlreadyExists([startNodeId, endId]);
    if (foundRelation) {
      // On envoie un requête
      deleteRelation(startNodeId, endId).then(() => {
        // On supprime le groupe Konva
        foundRelation[3].remove();
        // On supprime le groupe de texte si il existe (relation pondérée)
        if (foundRelation[4]) foundRelation[4].remove();
        relations.delete(foundRelation);
        layer.draw();
      });
    }
    // On enlève la surbriance des deux noeuds
    resetHighlight([startNodeId, endId]);
    // On attend que l'utilisteur sélectionne le premier noeud (état de base)
    relationStep = "first";
  }
}

/**
 * Met à jour le champ de sortie d'algorithme
 * @param {Array<number>} ids Les ids des noeuds
 */
function updateAlgoOutText(ids) {
  // On crée un texte la forme [nom1, nom2, ..., nomN]
  const text = `[${ids
    .map(id => nodes.get(id).children[1].text())
    .join(", ")}]`;
  algoOutText.innerText = text;
}

/**
 * Effectue le parcours en largeur (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolBfs(event) {
  // On récupère l'id du noeud cliqué
  startNodeId = getGroupIdFromEvent(event);
  // On envoie un requête
  breadthFirstSearch(startNodeId).then(result => {
    // On met à jour le texte de sortie
    updateAlgoOutText(result);
    // On lance l'animation
    return searchAnimation(result);
  });
}

/**
 * Effectue le parcours en profondeur (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolDfs(event) {
  // On récupère l'id du noeud cliqué
  startNodeId = getGroupIdFromEvent(event);
  // On envoie un requête
  depthFirstSearch(startNodeId).then(result => {
    // On met à jour le texte de sortie
    updateAlgoOutText(result);
    // On lance l'animation
    return searchAnimation(result);
  });
}

/**
 * Effectue l'algorithme de Dijkstra (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolDijkstra(event) {
  if (relationStep === "first") {
    // Si l'utilisateur est en train de sélection le premier noeud
    // On récupère l'id du noeud cliqué
    startNodeId = getGroupIdFromEvent(event);
    // On met en surbriance le noeud cliqué
    highlightNodeById(startNodeId);
    // On attend que l'utilisateur clique sur le second noeud
    relationStep = "second";
  } else {
    // Si l'utilisateur est en train de sélection le second noeud
    // On récupère l'id du noeud cliqué
    const endId = getGroupIdFromEvent(event);
    // On met en surbriance le noeud cliqué
    highlightNodeById(endId);
    // On envoie un requête
    dijkstraAlgo(startNodeId, endId).then(result => {
      // On met à jour le texte de sortie
      updateAlgoOutText(result);
      // On lance l'animation
      return searchAnimation(result);
    });
    // On enlève la surbriance des deux noeuds
    resetHighlight([startNodeId, endId]);
    // On attend que l'utilisteur sélectionne le premier noeud (état de base)
    relationStep = "first";
  }
}

/**
 * Importe une matrice d'adjacence (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolImportMatrix(event) {
  // On récupère les coordonnées de la souris lors du clique
  const x = event.evt.layerX;
  const y = event.evt.layerY;
  // On récupère le texte du champ d'import de matrice
  const text = matrixTextInput.value;
  if (text) {
    // On demande à l'utilisateur les noms de noeuds
    const namesRaw = prompt("Noms ? de la forme: A,B,C");
    if (namesRaw) {
      const names = namesRaw.split(",");
      // On envoie un requête
      importMatrix(names, text, x, y).then(() => {
        // On rafraichit la page
        window.location.reload();
      });
    }
  }
}

function toolExportMatrix() {
  if (exportChooser.value === "matrix") {
    // Si l'utilisteur exporte vers une matrice
    // On envoie un requête
    exportMatrix().then(result => {
      const { matrix, names } = result;
      // On génère le texte contenant les noms des noeuds
      const namesText = `[${names.join(", ")}]`;
      // On génère le texte de la matrice
      const matrixText = matrix.map(arr => `[${arr.join(", ")}],`).join("\n");
      matrixTextInput.value = namesText + "\n\n" + matrixText;
    });
  } else if (exportChooser.value === "list") {
    // Si l'utilisateur exporte vers une liste
    // On envoie un requête
    exportList().then(result => {
      // On remplace les ids des noeuds par les noms des noeuds
      const namesResults = {};
      for (const [node, list] of Object.entries(result)) {
        console.log(node);
        const namesList = [];
        const nodeName = nodes.get(parseInt(node)).children[1].text();
        for (const id of list) {
          const name = nodes.get(id).children[1].text();
          namesList.push(name);
        }
        namesResults[nodeName] = namesList;
      }
      // On génère le texte de la liste
      const listText =
        "{\n" +
        Object.entries(namesResults)
          .map(([name, list]) => `${name}: [${list.join(", ")}],`)
          .join("\n") +
        "\n}";
      matrixTextInput.value = listText;
    });
  }
}
