// On récupère les éléments du DOM

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
const exportMatrixButton = document.getElementById("exportmatrix");
const matrixTextInput = document.getElementById("matrix-input");
const exportChooser = document.getElementById("exportselect");

const nodeColorPicker = document.getElementById("nodecolor");

const nodeRadiusSlider = document.getElementById("node-radius-input");

const orientedCheckBox = document.getElementById("orientedcheck");
const weightedCheckBox = document.getElementById("weightedcheck");

const algoOutText = document.getElementById("out");

// On associe chaque bouton à une action

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
    // Pour chaque action, on déselectionne les boutons qui ne correspondent
    // pas à l'action en cours
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
    // Si l'utilisateur clique sur le bouton en cours, on se remet en mode sans action
    toolState = "idle";
    // On déselectionne tout
    deselectAll();
  } else {
    // On passe l'action cliqué en action principale
    toolState = currentTool;
    // On sélection seulement le bouton de l'action
    selectOnly(currentTool);
  }
}

// On associe chaque bouton à son action
for (const [action, button] of Object.entries(actions)) {
  // On ajoute à chaque bouton un évènement de clique
  // qui appelera la fonction updateToolState avec l'action du bouton
  button.addEventListener("click", () => updateToolState(action));
}

// On associe un évènement au slide de taille des noeuds
nodeRadiusSlider.addEventListener("input", () => {
  // On met à jour la taille de noeuds dès que le slider est utilisé
  resizeNodes(nodeRadiusSlider.value);
});

// On met la valeur par défaut du slider à 40
nodeRadiusSlider.value = 40;

// On met la couleur par défaut
nodeColorPicker.value = "#808080";

// On associe un évènement de clique au bouton d'export de matrice
exportMatrixButton.addEventListener("click", () => {
  toolExportMatrix();
});
