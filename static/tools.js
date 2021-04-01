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
      if (toolWeighted) {
        weight = Number(prompt("Poids ?"));
      }
      createRelation(startNodeId, endId, toolOriented, weight).then(() => {
        drawRelation(startNodeId, endId, toolOriented, weight);
        layer.draw();
      });
    }
    resetHighlight([startNodeId, endId]);
    relationStep = "first";
  }
}

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

function toolDeleteNode(event) {
  const id = getGroupIdFromEvent(event);
  const group = nodes.get(id);
  if (group) {
    deleteNode(id).then(() => {
      deleteRelationsRelatedTo(id);
      group.remove();
      layer.draw();
    });
  }
}

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
        relations.delete(foundRelation);
        layer.draw();
        relationStep = "first";
      });
    }
    resetHighlight([startNodeId, endId]);
  }
}

function toolBfs(event) {
  startNodeId = getGroupIdFromEvent(event);
  breadthFirstSearch(startNodeId).then(result => {
    return searchAnimation(result);
  });
}

function toolDfs(event) {
  startNodeId = getGroupIdFromEvent(event);
  depthFirstSearch(startNodeId).then(result => {
    return searchAnimation(result);
  });
}

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

function toolImportMatrix() {
  const text = prompt("Matrice ?");
  const names = prompt("Noms (A,B,C) ?").split(",");
  importMatrix(names, text).then(() => {
    window.location.reload();
  });
}
