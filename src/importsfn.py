import re

# Expression régulière permettant d'empêcher les injections de code
is_matrix_correct = re.compile(
    r"\[(?:\[(?:(?:0|1),)+(?:(?:0|1),?)\],)+(?:\[(?:(?:0|1),)+(?:(?:0|1),?)\],?)\]"
)


def eval_matrix(text):
    """Transformer le texte en une matrice (double liste)"""
    text = text.replace(" ", "").replace("\n", "")
    result = is_matrix_correct.match(text)
    if result:
        return eval(text)
    else:
        raise RuntimeError("Illegal matrix text provided")


def node_name_to_id(storage, name):
    """Récupèrer un noeud en ayant son nom"""
    node = storage.get_node_by_name(name)
    return node


def import_data_from_matrix(storage, names, text, initial_coords):
    """Importer une matrice dans la base de données"""
    matrix = eval_matrix(text)
    if len(matrix) != len(matrix[0]):
        raise RuntimeError("Invalid matrix lenght")
    if len(matrix) != len(names):
        raise RuntimeError("Too many names provided")

    # On crée d'abord tous les noeuds et on les insère dans la base de données
    storage.create_many_nodes_by_name(names, initial_coords)

    relations = []

    # On transforme la matrice en une liste de relations
    for i in range(len(matrix[0])):
        for j in range(len(matrix)):
            if i == j:
                continue
            related_node = matrix[j][i]
            if related_node == 1:
                opposite_direction = (names[j], names[i], True)
                if opposite_direction in relations:
                    relations.remove(opposite_direction)
                    relations.append((names[i], names[j], False))
                else:
                    relations.append((names[i], names[j], True))

    replace_names_by_id = lambda relation: (
        node_name_to_id(storage, relation[0]),
        node_name_to_id(storage, relation[1]),
        relation[2],
        1,
    )

    # On remplace les noms des noeuds dans les relations par leurs ids respectifs
    result_relation = list(map(replace_names_by_id, relations))

    # On insère les relations dans la base de données
    storage.create_many_relations(result_relation)
