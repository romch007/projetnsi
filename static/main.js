const nodes = new Map();
const relations = new Set();

let toolState = "idle";
let toolOriented = false;
let toolWeighted = false;
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
  if (toolState === "creating_node") {
    const x = event.evt.layerX;
    const y = event.evt.layerY;

    const name = prompt("Nom du noeud ?");
    if (name) {
      createNode(name, x, y, "black").then(id => {
        drawNodeCircle(id, name, x, y);

        layer.draw();
      });
    }
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

function highlightNodeById(id) {
  const nodeGroup = nodes.get(id);
  const tween = new Konva.Tween({
    node: nodeGroup.children[0],
    duration: 0.1,
    fill: "#de6666"
  });
  tween.play();
}

function resetHighlight(ids) {
  for (const id of ids) {
    const nodeGroup = nodes.get(id);
    const tween = new Konva.Tween({
      node: nodeGroup.children[0],
      duration: 0.1,
      fill: "grey"
    });
    tween.play();
  }
}

function getGroupIdFromEvent(event) {
  const circleOrText = event.target;
  const group = circleOrText.parent;

  nodeId = searchNodeId(group);
  return nodeId;
}

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

function searchNodeId(nodeGroup) {
  for (const [id, group] of nodes) {
    if (group._id == nodeGroup._id) {
      return id;
    }
  }
  return -1;
}

function deleteRelationsRelatedTo(nodeId) {
  for (const relation of relations) {
    if (relation[0] == nodeId || relation[1] == nodeId) {
      relation[3].remove();
      if (relation[4]) relation[4].remove();
      relations.delete(relation);
    }
  }
}

function drawNodeCircle(id, name, x, y) {
  const group = new Konva.Group({
    x,
    y,
    draggable: true
  });
  const circle = new Konva.Circle({
    radius,
    fill: "grey",
    stroke: "black",
    strokeWidth: 2
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
    if (useApi) {
      updateNode(id, name, group.x(), group.y(), "grey");
    }
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
      drawNodeCircle(node.id, node.name, node.x, node.y);
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
