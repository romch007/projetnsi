const nodes = new Map();
const relations = new Set();

let toolState = "idle";
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

    const id = getId();

    drawNodeCircle(id, name, x, y);

    toolState = "idle";
    layer.draw();
  }
});

layer.on("click", event => {
  if (toolState === "selecting_start_node") {
    const circleOrText = event.target;
    const group = circleOrText.parent;

    startNodeId = searchNodeId(group);

    toolState = "selecting_end_node";
  } else if (toolState === "selecting_end_node") {
    const circleOrText = event.target;
    const group = circleOrText.parent;
    const endId = searchNodeId(group);

    drawRelation(startNodeId, endId, true, 8);

    toolState = "idle";
    layer.draw();
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

function isRelationInSet(relation) {
  for (const relationInSet of relations) {
    if (relationInSet[0] == relation[0] && relationInSet[1] == relation[1]) {
      return true;
    }
  }
  return false;
}

function searchNodeId(nodeGroup) {
  for (const [id, group] of nodes) {
    if (group._id == nodeGroup._id) {
      return id;
    }
  }
  return -1;
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

  nodes.set(id, group);

  group.add(circle);
  group.add(text);

  layer.add(group);
}

function drawRelation(startId, endId, oriented, weight) {
  const startNode = nodes.get(startId);
  const endNode = nodes.get(endId);

  // const group = new Konva.Group();

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

  if (weight != 1) {
    const text = new Konva.Text({
      text: weight.toString(),
      x: (startNode.x() + endNode.x()) / 2,
      y: (startNode.y() + endNode.y()) / 2
    });
    // group.add(text);
  }

  relations.add(line);

  startNode.on("dragmove", event => {
    line.points(makeCoords(startNode, endNode));
  });
  endNode.on("dragmove", event => {
    line.points(makeCoords(startNode, endNode));
  });
}

function getId() {
  return 8;
}

drawNodeCircle(1, "A", 100, 100);
drawNodeCircle(2, "B", 200, 200);
layer.draw();

const useApi = false;

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
        drawRelation(relation.start_id, relation.end_id);
      }
      layer.draw();
    });
}
