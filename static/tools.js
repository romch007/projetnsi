/**
 * Crée un noeud (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolCreateNode(event) {
  const x = event.evt.layerX;
  const y = event.evt.layerY;

  const name = prompt("Nom du noeud ?");
  if (name) {
    const args = [name, x, y, nodeColorPicker.value];
    createNode(...args).then(id => {
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
    startNodeId = getGroupIdFromEvent(event);
    highlightNodeById(startNodeId);
    relationStep = "second";
  } else {
    const endId = getGroupIdFromEvent(event);
    highlightNodeById(endId);
    if (startNodeId != endId && !relationAlreadyExists([startNodeId, endId])) {
      let weight = 1;
      if (weightedCheckBox.checked) {
        weight = Number(prompt("Poids ?"));
      }
      const args = [startNodeId, endId, orientedCheckBox.checked, weight];
      createRelation(...args).then(() => {
        drawRelation(...args);
        layer.draw();
      });
    }
    resetHighlight([startNodeId, endId]);
    relationStep = "first";
  }
}

/**
 * Modifie un noeud (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolEditNode(event) {
  const nodeId = getGroupIdFromEvent(event);
  const newName = prompt("Nouveau nom ?");
  const clickedGroup = nodes.get(nodeId);
  if (clickedGroup && newName) {
    updateNode(
      nodeId,
      newName,
      clickedGroup.x(),
      clickedGroup.y(),
      "grey"
    ).then(() => {
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
  const id = getGroupIdFromEvent(event);
  const group = nodes.get(id);
  if (group) {
    deleteNode(id).then(() => {
      nodes.delete(id);
      deleteRelationsRelatedTo(id);
      group.remove();
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
    startNodeId = getGroupIdFromEvent(event);
    highlightNodeById(startNodeId);
    relationStep = "second";
  } else {
    const endId = getGroupIdFromEvent(event);
    highlightNodeById(endId);
    const foundRelation = relationAlreadyExists([startNodeId, endId]);
    if (foundRelation) {
      deleteRelation(startNodeId, endId).then(() => {
        foundRelation[3].remove();
        if (foundRelation[4]) foundRelation[4].remove();
        relations.delete(foundRelation);
        layer.draw();
        relationStep = "first";
      });
    }
    resetHighlight([startNodeId, endId]);
  }
}

/**
 * Met à jour le champ de sortie d'algorithme
 * @param {Array<number>} ids Les ids des noeuds
 */
function updateAlgoOutText(ids) {
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
  startNodeId = getGroupIdFromEvent(event);
  breadthFirstSearch(startNodeId).then(result => {
    updateAlgoOutText(result);
    return searchAnimation(result);
  });
}

/**
 * Effectue le parcours en profondeur (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolDfs(event) {
  startNodeId = getGroupIdFromEvent(event);
  depthFirstSearch(startNodeId).then(result => {
    updateAlgoOutText(result);
    return searchAnimation(result);
  });
}

/**
 * Effectue l'algorithme de Dijkstra (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolDijkstra(event) {
  if (relationStep === "first") {
    startNodeId = getGroupIdFromEvent(event);
    highlightNodeById(startNodeId);
    relationStep = "second";
  } else {
    const endId = getGroupIdFromEvent(event);
    highlightNodeById(endId);
    dijkstraAlgo(startNodeId, endId).then(result => {
      relationStep = "first";
      updateAlgoOutText(result);
      return searchAnimation(result);
    });
    resetHighlight([startNodeId, endId]);
  }
}

/**
 * Importe une matrice d'adjacence (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolImportMatrix(event) {
  const x = event.evt.layerX;
  const y = event.evt.layerY;
  const text = matrixTextInput.value;
  if (text) {
    const namesRaw = prompt("Noms ? de la forme: A,B,C");
    if (namesRaw) {
      const names = namesRaw.split(",");
      importMatrix(names, text, x, y).then(() => {
        window.location.reload();
      });
    }
  }
}

function toolExportMatrix() {
  if (exportChooser.value === "matrix") {
    exportMatrix().then(result => {
      const { matrix, names } = result;
      const namesText = `[${names.join(", ")}]`;
      const matrixText = matrix.map(arr => `[${arr.join(", ")}],`).join("\n");
      matrixTextInput.value = namesText + "\n\n" + matrixText;
    });
  } else if (exportChooser.value === "list") {
    exportList().then(result => {
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
