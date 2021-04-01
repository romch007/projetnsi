const createNodeButton = document.getElementById("createnode");
const createRelationButton = document.getElementById("createrelation");

const editNodeButton = document.getElementById("editnode");
const editRelationButton = document.getElementById("editrelation");

const deleteNodeButton = document.getElementById("deletenode");
const deleteRelationButton = document.getElementById("deleterelation");

const dfsButton = document.getElementById("dfs");
const bfsButton = document.getElementById("bfs");
const dijkstraButton = document.getElementById("dijkstra");

const importMatrixButton = document.getElementById("importmatrix");

const orientedCheckBox = document.getElementById("orientedcheck");
const weightedCheckBox = document.getElementById("weightedcheck");

const actions = {
  creating_node: createNodeButton,
  creating_relation: createRelationButton,
  editing_node: editNodeButton,
  editing_relation: editRelationButton,
  deleting_node: deleteNodeButton,
  deleting_relation: deleteRelationButton,
  bfs: bfsButton,
  dfs: dfsButton,
  dijkstra: dijkstraButton,
  import_matrix: importMatrixButton
};

function selectOnly(targetAction) {
  for (const [action, button] of Object.entries(actions)) {
    if (targetAction === action) {
      button.classList.add("selected");
    } else {
      button.classList.remove("selected");
    }
  }
}

function deselectAll() {
  for (const button of Object.values(actions)) {
    button.classList.remove("selected");
  }
}

function updateToolState(currentTool) {
  if (currentTool === toolState) {
    toolState = "idle";
    deselectAll();
  } else {
    toolState = currentTool;
    selectOnly(currentTool);
  }
}

for (const [action, button] of Object.entries(actions)) {
  button.addEventListener("click", () => updateToolState(action));
}

orientedCheckBox.addEventListener("input", () => {
  toolOriented = orientedCheckBox.checked;
});

weightedCheckBox.addEventListener("input", () => {
  toolWeighted = weightedCheckBox.checked;
});
