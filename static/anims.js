async function searchAnimation(ids) {
  const nodesPath = ids.map(id => nodes.get(id));
  for (const node of nodesPath) {
    const tween = new Konva.Tween({
      node: node.children[0],
      easing: Konva.Easings.EaseOut,
      fill: "#0d5e17",
      duration: 0.5
    });
    await wait(400);
    tween.play();
  }
  await wait(8000);
  for (const node of nodesPath) {
    const tween = new Konva.Tween({
      node: node.children[0],
      easing: Konva.Easings.StrongEaseOut,
      fill: "grey",
      duration: 2
    });
    tween.play();
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
