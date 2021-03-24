const newPointButton = document.getElementById("newpoint");
const newRelationButton = document.getElementById("newrelation");

newPointButton.addEventListener("click", () => {
  toolState = "creating_node";
});

newRelationButton.addEventListener("click", () => {
  toolState = "selecting_start_node";
});
