const stage = new Konva.Stage({
  container: "container",
  width: 1000,
  height: 800
});

const layer = new Konva.Layer();

stage.add(layer);

const alpha = "abcdefghijklmnopqrstuvwxyz";

function idToString(id) {
  const chars = [];
  for (let i = 0; i < id; i++) {
    const pos = i % alpha.length;
    chars.push(alpha[pos]);
  }
  return chars.join("");
}

function drawNodeCircle(id, name, x, y) {
  const group = new Konva.Group({ x, y, draggable: true, id: idToString(id) });
  const circle = new Konva.Circle({
    x,
    y,
    radius: 40,
    fill: "grey",
    stroke: "black",
    strokeWidth: 2
  });
  const text = new Konva.Text({
    x,
    y,
    text: name,
    fontSize: 15,
    fontFamily: "Arial"
  });

  group.add(circle);
  group.add(text);

  layer.add(group);
}

function drawRelation(startId, endId) {
  const startCircle = stage.find(`#${idToString(startId)}`)[0];
  const endCircle = stage.find(`#${idToString(endId)}`)[0];

  console.log(startCircle);

  const line = new Konva.Line({
    points: [startCircle.x(), startCircle.y(), endCircle.x(), endCircle.y()],
    stroke: "black",
    strokeWidth: 3
  });
  layer.add(line);
}

drawNodeCircle(1, "test", 100, 100);
drawNodeCircle(2, "saalut", 300, 300);

// drawRelation();

layer.draw();
