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

const nodeColorPicker = document.getElementById("nodecolor");

const nodeRadiusSlider = document.getElementById("node-radius-input");

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

/**
 * Sélectionne le menu donné et déselectionne tous les autres
 * @param {string} targetAction Le nom du menu
 */
function selectOnly(targetAction) {
  for (const [action, button] of Object.entries(actions)) {
    if (targetAction === action) {
      button.classList.add("selected");
    } else {
      button.classList.remove("selected");
    }
  }
}

/**
 * Déselectionne tous les menus
 */
function deselectAll() {
  for (const button of Object.values(actions)) {
    button.classList.remove("selected");
  }
}

/**
 * Met à jour le menu sélectionné
 * @param {string} currentTool Le menu cliqué
 */
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

nodeRadiusSlider.addEventListener("input", () => {
  resizeNodes(nodeRadiusSlider.value);
});

nodeRadiusSlider.value = radius;

nodeColorPicker.value = "#808080";
