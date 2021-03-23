const nodes = new Map();
const relations = new Set();

const stage = new Konva.Stage({
  container: "container",
  width: 1000,
  height: 800
});

const layer = new Konva.Layer();

stage.add(layer);

function isRelationInSet(relation) {
  for (const relationInSet of relations) {
    if (relationInSet[0] == relation[0] && relationInSet[1] == relation[1]) {
      return true;
    }
  }
  return false;
}

function drawNodeCircle(id, name, x, y) {
  const group = new Konva.Group({
    x,
    y,
    draggable: true
  });
  const circle = new Konva.Circle({
    radius: 40,
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

function drawRelation(startId, endId) {
  const startNode = nodes.get(startId);
  const endNode = nodes.get(endId);

  const line = new Konva.Line({
    points: [startNode.x(), startNode.y(), endNode.x(), endNode.y()],
    stroke: "black",
    strokeWidth: 3
  });
  layer.add(line);
  line.moveToBottom();
  relations.add(line);

  startNode.on("dragmove", event => {
    line.points([
      startNode.x(),
      startNode.y(),
      line.points()[2],
      line.points()[3]
    ]);
  });
  endNode.on("dragmove", event => {
    line.points([line.points()[0], line.points()[1], endNode.x(), endNode.y()]);
  });
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
        drawRelation(relation.start_id, relation.end_id);
      }
      layer.draw();
    });
}
