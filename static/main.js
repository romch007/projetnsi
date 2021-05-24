// On crée un dictionnaire qui contiendra les noeuds
const nodes = new Map();
// On crée un set qui contiendra les relations
const relations = new Set();

// L'outil actuellement sélectioné
let toolState = "idle";
// Si la case orienté est cochée
let toolOriented = false;
// Si la case pondérée est cochée
let toolWeighted = false;
// La couleur actuelle du selecteur de couleur
let hexNodeColor = "#808080";
// Si l'utilisateur en est à sélection le premier noeud (outil nécessitant la sélection de deux noeuds)
let relationStep = "first";
// L'id du premier noeud sélectioné
let startNodeId;

// Définis la taille de kanvas (espace de dessin)
const width = 1000;
const height = 800;
let radius = 40;

// Crée l'espace de dessin
const stage = new Konva.Stage({
  container: "container",
  width,
  height
});

// Crée un sous espace de dessin pour interagir avec les évenements(interraction avec l'utilisateur)
// Le stage est un plan et le layer est un sous plan qui se surperpose au stage.
// On interragie avec le plan le plus haut
const layer = new Konva.Layer();

// Ajoute ce sous niveau au Konvas
stage.add(layer);

// Lorsque l'utilisateur clique sur le Knovas (espace de dessin (grand fenetre blanche))), declanche l'évenement click
stage.on("click", event => {
  switch (toolState) {
    // Crée un nouveau point
    case "creating_node":
      toolCreateNode(event);
      break;
    // Import la matrice à la position de l'évenement clique
    case "import_matrix":
      toolImportMatrix(event);
      break;
  }
});

// Lorsqu'on clique sur le sous espace de dessin
layer.on("click", event => {
  switch (toolState) {
    // Crée une relation lorqu'on clique sur un point
    case "creating_relation":
      toolCreateRelation(event);
      break;
    // Modifie un point pour le renommer
    case "editing_node":
      toolEditNode(event);
      break;
    // Supprime un point
    case "deleting_node":
      toolDeleteNode(event);
      break;
    // Supprime une relation
    case "deleting_relation":
      toolDeleteRelation(event);
      break;
    // Calcule et anime le parcours en largeur
    case "bfs":
      toolBfs(event);
      break;
    // Calcule et anime le parcours profondeur
    case "dfs":
      toolDfs(event);
      break;
    // Calcule et anime l'algorythme de dijstra
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
  // On récupère le noeud
  const nodeGroup = nodes.get(id);
  const tween = new Konva.Tween({
    node: nodeGroup.children[0],
    duration: 0.1,
    shadowOpacity: 0.5
  });
  // On lance l'animation
  tween.play();
}

/**
 * Enlève la surbriance des noeuds donnés
 * @param {Array<number>} ids Les ids des noeuds
 */
function resetHighlight(ids) {
  for (const id of ids) {
    // On récupère le noeud
    const nodeGroup = nodes.get(id);
    const tween = new Konva.Tween({
      node: nodeGroup.children[0],
      duration: 0.1,
      shadowOpacity: 0
    });
    // On lance l'animation
    tween.play();
  }
}

/**
 * Récupère l'id du noeud cliqué lors d'un click
 * @param {Object} event L'évènement généré par Konva
 * @returns {number} L'id du noeud
 */
function getGroupIdFromEvent(event) {
  // On récupère le cercle ou le texte cliqué
  const circleOrText = event.target;
  // On récupère le groupe parent
  const group = circleOrText.parent;

  // On cherche son id
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
    // Pour chaque relation on vérifie si la relation donnée n'est pas la même
    if (relationInSet[0] == relation[0] && relationInSet[1] == relation[1]) {
      return relationInSet;
    } else if (
      // Si la relation n'est pas orientée on vérifie de façon inverse
      !relation[2] &&
      relationInSet[0] == relation[1] &&
      relationInSet[1] == relation[0]
    ) {
      // On retourne la relation trouvée
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
    // On compare les ids Konva
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
    // Pour chaque relation on regarde si le noeud donné fait partie de la relation
    if (relation[0] == nodeId || relation[1] == nodeId) {
      // On supprime le trait de la relation
      relation[3].remove();
      // On supprime le texte s'il existe
      if (relation[4]) relation[4].remove();
      // On retire la relation du set
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
  // Crée un nouveau groupe qui contient le cercle et texte
  // Le groupe permet que le cercle et le texte partage les mêmes propriétés
  const group = new Konva.Group({
    x,
    y,
    draggable: true
  });
  // Crée un cercle
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

  // Crée un nouveau texte
  const text = new Konva.Text({
    text: name,
    fontSize: 15,
    fontFamily: "Arial",
    align: "center",
    verticalAlign: "middle",
    width: circle.radius() * 2,
    height: circle.radius(),
    offsetX: circle.radius(),
    offsetY: circle.radius() / 2
  });

  // Lorsque le groupe se fait déplacer on actualise sa position dans la base de donnée
  group.on("dragend", () => {
    updateNode(id, name, group.x(), group.y(), group.children[0].fill());
  });

  // Change l'apparence du curseur lorqu'il est au-dessus du groupe
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
    } else if (toolState === "idle") {
      stage.container().style.cursor = "move";
    }
  });
  // Change l'apparence du curseur lorqu'il n'est plus au-dessus du groupe
  group.on("mouseleave", () => {
    stage.container().style.cursor = "default";
  });

  // Enregistre le point dans le dictionnaire des points
  nodes.set(id, group);
  // Ajoute au groupe le cercle et le texte
  group.add(circle);
  group.add(text);
  // Ajoute le groupe au sous espace de dessin
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
  // On récupère les deux noeuds
  const startNode = nodes.get(startId);
  const endNode = nodes.get(endId);

  // On crée un tableau qui sera inséré dans le set
  const relationSet = [];

  // On crée un objet avec les arguments
  const options = {
    points: makeCoords(startNode, endNode),
    stroke: "black",
    strokeWidth: 3,
    fill: "black"
  };

  let line;

  // Si la relation est orientée, on utilise l'objet Arrow au lieu de Line
  if (oriented) {
    line = new Konva.Arrow(options);
  } else {
    line = new Konva.Line(options);
  }

  // On ajoute la relation à la couche de dessin
  layer.add(line);
  line.moveToBottom();

  relationSet.push(startId, endId, oriented, line);

  let textGroup;
  if (weight != 1) {
    // Si la relation est pondérée, on va créer un texte
    const roundedWeight = Math.round(weight);
    // On compte le nombre de chiffre que contient le texte
    const digitCount = roundedWeight.toString().length;
    // On crée le groupe
    textGroup = new Konva.Group({
      x: (startNode.x() + endNode.x()) / 2,
      y: (startNode.y() + endNode.y()) / 2
    });
    const width = 10 * digitCount;
    // On crée le texte
    const text = new Konva.Text({
      text: roundedWeight.toString(),
      fill: "black",
      width,
      height: 15,
      offsetX: width / 2,
      offsetY: 7,
      fontSize: 14,
      align: "center",
      verticalAlign: "middle"
    });
    // On crée le rectangle blanc qui sera en dessous du texte (pour le faire ressortir)
    const rect = new Konva.Rect({
      fill: "white",
      width: text.width(),
      height: 15,
      offsetX: text.offsetX(),
      offsetY: text.offsetY()
    });
    // On les ajoute au groupe
    textGroup.add(text);
    textGroup.add(rect);

    layer.add(textGroup);
    text.moveUp();
    relationSet.push(textGroup);
  }

  relations.add(relationSet);

  // On crée une fonction de fonction qui permettra de redessiner les relations
  const lineUpdateEvent = (startNode, endNode) => () => {
    line.points(makeCoords(startNode, endNode));
    if (weight != 1) {
      textGroup.x((startNode.x() + endNode.x()) / 2);
      textGroup.y((startNode.y() + endNode.y()) / 2);
    }
  };

  // On redessine les relations quand la taille des noeuds change
  nodeRadiusSlider.addEventListener(
    "input",
    lineUpdateEvent(startNode, endNode)
  );
  // On redessine les relations quand les noeuds sont bougés
  startNode.on("dragmove", lineUpdateEvent(startNode, endNode));
  endNode.on("dragmove", lineUpdateEvent(startNode, endNode));
}

/**
 * Redimensionne l'espace de dessin (Konvas)
 */
function fitStageIntoParentContainer() {
  // On récupère la div contenant le canvas
  const container = document.querySelector("#container");

  // On redimensionne le canvas
  const containerWidth = container.offsetWidth;
  const scale = containerWidth / width;

  stage.width(width * scale * 0.6);
  stage.draw();
}

// On redimenssione le canvas et on ajoute un évènement qui permettra de redimenssioner
// le canvas quand la taille de la fenêtre change
fitStageIntoParentContainer();
window.addEventListener("resize", fitStageIntoParentContainer);

// On récupère tous les noeuds grâce à l'api
getAllNodes()
  .then(nodes => {
    // Une fois la réponse reçue, on les dessine tous
    for (const node of nodes) {
      drawNodeCircle(node.id, node.name, node.x, node.y, node.color);
    }

    // On récupère toutes le relations grâce à l'api
    return getAllRelations();
  })
  .then(relations => {
    // Une fois la réponse reçue, on les dessine toutes
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
