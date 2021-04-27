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
 * Effectue le parcours en largeur (action utilisateur)
 * @param {Object} event L'évènement généré par Konva
 */
function toolBfs(event) {
  startNodeId = getGroupIdFromEvent(event);
  breadthFirstSearch(startNodeId).then(result => {
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
  const text = prompt("Matrice ?");
  if (text) {
    const namesRaw = prompt("Noms (A,B,C) ?");
    if (namesRaw) {
      const names = namesRaw.split(",");
      importMatrix(names, text, x, y).then(() => {
        window.location.reload();
      });
    }
  }
}
