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
      if (useApi) {
        createNode(name, x, y, "black").then(id => {
          drawNodeCircle(id, name, x, y);

          layer.draw();
        });
      } else {
        const id = getId();

        drawNodeCircle(id, name, x, y);

        layer.draw();
      }
    }
  }
});

layer.on("click", event => {
  switch (toolState) {
    case "creating_relation":
      if (relationStep === "first") {
        startNodeId = getGroupIdFromEvent(event);

        relationStep = "second";
      } else {
        const endId = getGroupIdFromEvent(event);

        if (
          startNodeId != endId &&
          !relationAlreadyExists([startNodeId, endId])
        ) {
          let weight = 1;
          if (toolWeighted) {
            weight = Number(prompt("Poids ?"));
          }
          if (useApi) {
            createRelation(startNodeId, endId, toolOriented, weight).then(
              () => {
                drawRelation(startNodeId, endId, toolOriented, weight);
                layer.draw();
              }
            );
          } else {
            drawRelation(startNodeId, endId, toolOriented, weight);
            layer.draw();
          }
        }
        layer.draw();
        relationStep = "first";
      }
      break;
    case "editing_node":
      break;
    case "deleting_node":
      const id = getGroupIdFromEvent(event);
      const group = nodes.get(id);
      if (nodes.has(id)) {
        if (useApi) {
          deleteNode(id).then(() => {
            deleteRelationsRelatedTo(id);
            group.remove();
            layer.draw();
          });
        } else {
          group.remove();
          layer.draw();
        }
      }
      break;
    case "deleting_relation":
      if (relationStep === "first") {
        startNodeId = getGroupIdFromEvent(event);

        relationStep = "second";
      } else {
        const endId = getGroupIdFromEvent(event);
        const foundRelation = relationAlreadyExists([startNodeId, endId]);
        if (foundRelation) {
          if (useApi) {
            deleteRelation(startNodeId, endId).then(() => {
              foundRelation[3].remove();
              relations.delete(foundRelation);
              layer.draw();
              relationStep = "first";
            });
          } else {
            relations.delete(foundRelation);
            layer.draw();
            relationStep = "first";
          }
        }
      }
      break;
    case "bfs":
      startNodeId = getGroupIdFromEvent(event);
      breadthFirstSearch(startNodeId).then(result => {
        return searchAnimation(result);
      });
      break;
    case "dfs":
      startNodeId = getGroupIdFromEvent(event);
      depthFirstSearch(startNodeId).then(result => {
        return searchAnimation(result);
      });
      break;
    case "dijkstra":
      if (relationStep === "first") {
        startNodeId = getGroupIdFromEvent(event);

        relationStep = "second";
      } else {
        const endId = getGroupIdFromEvent(event);

        dijkstraAlgo(startNodeId, endId).then(result => {
          return searchAnimation(result);
        });
      }
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
    if (relation[0] == nodeId || relation[0] == nodeId) {
      relation[3].remove();
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

  let text;
  if (weight != 1) {
    text = new Konva.Text({
      text: weight.toString(),
      x: (startNode.x() + endNode.x()) / 2,
      y: (startNode.y() + endNode.y()) / 2,
      fill: "black",
      width: 30,
      heigh: 10,
      offsetX: 15,
      offsetY: 5,
      fontSize: 14,
      align: "center",
      verticalAlign: "middle"
    });
    layer.add(text);
    relationSet.push(text);
  }

  relations.add(relationSet);

  const lineUpdateEvent = (startNode, endNode) => () => {
    line.points(makeCoords(startNode, endNode));
    if (weight != 1) {
      text.x((startNode.x() + endNode.x()) / 2);
      text.y((startNode.y() + endNode.y()) / 2);
    }
  };

  startNode.on("dragmove", lineUpdateEvent(startNode, endNode));
  endNode.on("dragmove", lineUpdateEvent(startNode, endNode));
}

function getId() {
  return Math.max(...nodes.keys()) + 1;
}

const useApi = true;

if (useApi) {
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
}
