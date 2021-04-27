const nodes = new Map();
const relations = new Set();

let toolState = "idle";
let toolOriented = false;
let toolWeighted = false;
let hexNodeColor = "#808080";
let relationStep = "first";
let startNodeId;

const width = 1000;
const height = 800;
const radius = 40;

const stage = new Konva.Stage({
  container: "container",
  width,
  height
});

const layer = new Konva.Layer();

stage.add(layer);

stage.on("click", event => {
  switch (toolState) {
    case "creating_node":
      toolCreateNode(event);
      break;
    case "import_matrix":
      toolImportMatrix(event);
      break;
  }
});

layer.on("click", event => {
  switch (toolState) {
    case "creating_relation":
      toolCreateRelation(event);
      break;
    case "editing_node":
      toolEditNode(event);
      break;
    case "deleting_node":
      toolDeleteNode(event);
      break;
    case "deleting_relation":
      toolDeleteRelation(event);
      break;
    case "bfs":
      toolBfs(event);
      break;
    case "dfs":
      toolDfs(event);
      break;
    case "dijkstra":
      toolDijkstra(event);
      break;
  }
});

/**
 * Calculer les coordoonées des extrémités d'une relation
 * @param {Konva.Group} startNode Le premier noeud
 * @param {Konva.Group} endNode Le deuxième noeud
 * @returns {[number, number, number, number]} Les coordonées
 */
function makeCoords(startNode, endNode) {
  const coords = [];
  const startT = Math.atan2(
    endNode.y() - startNode.y(),
    endNode.x() - startNode.x()
  );
  const startX = radius * Math.cos(startT) + startNode.x();
  const startY = radius * Math.sin(startT) + startNode.y();
  coords.push(startX, startY);

  const endT = Math.atan2(
    startNode.y() - endNode.y(),
    startNode.x() - endNode.x()
  );
  const endX = radius * Math.cos(endT) + endNode.x();
  const endY = radius * Math.sin(endT) + endNode.y();
  coords.push(endX, endY);

  return coords;
}

/**
 * Met visuellement en surbriance un noeud
 * @param {string} id L'id du noeud
 */
function highlightNodeById(id) {
  const nodeGroup = nodes.get(id);
  const tween = new Konva.Tween({
    node: nodeGroup.children[0],
    duration: 0.1,
    shadowOpacity: 0.5
  });
  tween.play();
}

/**
 * Enlève la surbriance des noeuds donnés
 * @param {Array<number>} ids Les ids des noeuds
 */
function resetHighlight(ids) {
  for (const id of ids) {
    const nodeGroup = nodes.get(id);
    const tween = new Konva.Tween({
      node: nodeGroup.children[0],
      duration: 0.1,
      shadowOpacity: 0
    });
    tween.play();
  }
}

/**
 * Récupère l'id du noeud cliqué lors d'un click
 * @param {Object} event L'évènement généré par Konva
 * @returns {number} L'id du noeud
 */
function getGroupIdFromEvent(event) {
  const circleOrText = event.target;
  const group = circleOrText.parent;

  nodeId = searchNodeId(group);
  return nodeId;
}

/**
 * Vérifie sur une relation existe déjà
 * @param {[number, number, boolean, Konva.Group]} relation La relation recherchée
 * @returns {[number, number, boolean, Konva.Group]} La relation trouvé
 */
function relationAlreadyExists(relation) {
  for (const relationInSet of relations) {
    if (relationInSet[0] == relation[0] && relationInSet[1] == relation[1]) {
      return relationInSet;
    } else if (
      !relation[2] &&
      relationInSet[0] == relation[1] &&
      relationInSet[1] == relation[0]
    ) {
      return relationInSet;
    }
  }
  return null;
}

/**
 * Récupère l'id d'un groupe Konva
 * @param {Konva.Group} nodeGroup Le groupe Konva
 * @returns {number} L'id du groupe, -1 si non trouvé
 */
function searchNodeId(nodeGroup) {
  for (const [id, group] of nodes) {
    if (group._id == nodeGroup._id) {
      return id;
    }
  }
  return -1;
}

/**
 * Supprime les relations associées au noeud donné
 * @param {number} nodeId L'id du noeud
 */
function deleteRelationsRelatedTo(nodeId) {
  for (const relation of relations) {
    if (relation[0] == nodeId || relation[1] == nodeId) {
      relation[3].remove();
      if (relation[4]) relation[4].remove();
      relations.delete(relation);
    }
  }
}

/**
 * Dessiner et enregistre un nouveau noeud
 * @param {number} id L'id du noeud
 * @param {string} name Le nom du noeud
 * @param {number} x L'abscisse initiale du noeud
 * @param {number} y L'ordonnée initiale du noeud
 * @param {string} color La couleur initiale du noeud
 */
function drawNodeCircle(id, name, x, y, color) {
  const group = new Konva.Group({
    x,
    y,
    draggable: true
  });
  const circle = new Konva.Circle({
    radius,
    fill: color,
    stroke: "black",
    strokeWidth: 2,
    shadowOpacity: 0,
    shadowColor: "black",
    shadowBlur: 10,
    shadowOffset: { x: 5, y: 5 }
  });

  const text = new Konva.Text({
    text: name,
    fontSize: 15,
    fontFamily: "Arial",
    align: "center",
    verticalAlign: "middle",
    width: circle.radius(),
    height: circle.radius(),
    offsetX: circle.radius() / 2,
    offsetY: circle.radius() / 2
  });

  group.on("dragend", () => {
    updateNode(id, name, group.x(), group.y(), group.children[0].fill());
  });

  group.on("mouseenter", () => {
    if (
      [
        "creating_relation",
        "editing_relation",
        "deleting_relation",
        "editing_node",
        "deleting_node",
        "bfs",
        "dfs",
        "dijkstra"
      ].includes(toolState)
    ) {
      stage.container().style.cursor = "pointer";
    }
  });
  group.on("mouseleave", () => {
    stage.container().style.cursor = "default";
  });

  nodes.set(id, group);

  group.add(circle);
  group.add(text);

  layer.add(group);
}

/**
 * Dessine et enregistre une nouvelle relation
 * @param {number} startId L'id du noeud de départ
 * @param {number} endId L'id du noeud d'arrivée
 * @param {boolean} oriented Si la relation est orientée
 * @param {number} weight Le poids de la relation
 */
function drawRelation(startId, endId, oriented, weight) {
  const startNode = nodes.get(startId);
  const endNode = nodes.get(endId);

  const relationSet = [];

  const options = {
    points: makeCoords(startNode, endNode),
    stroke: "black",
    strokeWidth: 3,
    fill: "black"
  };

  let line;

  if (oriented) {
    line = new Konva.Arrow(options);
  } else {
    line = new Konva.Line(options);
  }

  layer.add(line);
  line.moveToBottom();
  relationSet.push(startId, endId, oriented, line);

  let textGroup;
  if (weight != 1) {
    const digitCount = weight.toString().length;
    textGroup = new Konva.Group({
      x: (startNode.x() + endNode.x()) / 2,
      y: (startNode.y() + endNode.y()) / 2
    });
    const width = 10 * digitCount;
    const text = new Konva.Text({
      text: weight.toString(),
      fill: "black",
      width,
      height: 15,
      offsetX: width / 2,
      offsetY: 7,
      fontSize: 14,
      align: "center",
      verticalAlign: "middle"
    });
    const rect = new Konva.Rect({
      fill: "white",
      width: text.width(),
      height: 15,
      offsetX: text.offsetX(),
      offsetY: text.offsetY()
    });
    textGroup.add(text);
    textGroup.add(rect);

    layer.add(textGroup);
    text.moveUp();
    relationSet.push(textGroup);
  }

  relations.add(relationSet);

  const lineUpdateEvent = (startNode, endNode) => () => {
    line.points(makeCoords(startNode, endNode));
    if (weight != 1) {
      textGroup.x((startNode.x() + endNode.x()) / 2);
      textGroup.y((startNode.y() + endNode.y()) / 2);
    }
  };

  startNode.on("dragmove", lineUpdateEvent(startNode, endNode));
  endNode.on("dragmove", lineUpdateEvent(startNode, endNode));
}

getAllNodes()
  .then(nodes => {
    for (const node of nodes) {
      drawNodeCircle(node.id, node.name, node.x, node.y, node.color);
    }

    return getAllRelations();
  })
  .then(relations => {
    for (const relation of relations) {
      drawRelation(
        relation.start_id,
        relation.end_id,
        relation.oriented,
        relation.weight
      );
    }
    layer.draw();
  });
