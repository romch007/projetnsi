/**
 * Applique une animation visuelle aux noeuds donnés
 * @param {Array<number>} ids Les ids des noeuds (dans l'ordre)
 * @async
 */
async function searchAnimation(ids) {
  // On récupère les groupes Konva à partir des ids des noeuds
  const nodesPath = ids.map(id => nodes.get(id));
  for (const node of nodesPath) {
    // On lance pour chaque noeud l'animation avec un écart de 450 ms
    const tween = new Konva.Tween({
      node: node.children[0],
      easing: Konva.Easings.EaseOut,
      shadowOpacity: 0.7,
      duration: 0.5
    });
    await wait(450);
    tween.play();
  }
  await wait(8000);
  // Après 8 secondes on remet les noeuds à leurs paramètres par défaut
  for (const node of nodesPath) {
    const tween = new Konva.Tween({
      node: node.children[0],
      easing: Konva.Easings.StrongEaseOut,
      shadowOpacity: 0,
      duration: 2
    });
    tween.play();
  }
}

/**
 * Met l'éxécution en pause
 * @param {number} ms Le temps d'attente en millisecondes
 * @returns {Promise}
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
