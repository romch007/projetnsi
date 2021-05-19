import math


def create_dict(nodes, relations):
    """Crée une liste d'adjacence à partir d'une liste de noeuds et de relations"""
    result = {}
    # Pour chaque noeud
    for node in nodes:
        id = node[0]
        neighbours = []
        # Pour chaque relation
        for relation in relations:
            start = relation[0]
            end = relation[1]
            oriented = relation[2] == 1
            # On vérifie si le noeud est concerné par la relation,
            if start == id:
                # dans ce cas on l'ajoute l'autre noeud concerné dans la liste des voisins
                neighbours.append(end)
            elif end == id and not oriented:
                neighbours.append(start)
        # finalement on ajoute le noeud et ses voisins au dictionnaire
        result[id] = neighbours
    return result


def create_weighted_dict(nodes, relations):
    """Crée une liste d'adjacence pondérée à partir d'une liste de noeuds et de relations"""
    # Similaire à la fonction create_dict, sauf qu'on renseigne aussi les poids des relations
    result = {}
    for node in nodes:
        id = node[0]
        neighbours_dict = {}
        for relation in relations:
            start = relation[0]
            end = relation[1]
            oriented = relation[2] == 1
            weight = relation[3]
            if start == id:
                neighbours_dict[end] = weight
            elif end == id and not oriented:
                neighbours_dict[start] = weight
        result[id] = neighbours_dict
    return result


def breadth_first_search(start_node, grap_dict):
    """
    Parcours en largeur
    """
    if start_node not in grap_dict.keys():
        raise RuntimeError("Node not in graph")
    queue = [start_node]
    path = []
    # Tant que la file n'est pas vide, on défile un noeud et on ajoute ses voisins à la file
    while queue:
        current_node = queue[0]
        for neighbour in grap_dict[current_node]:
            if neighbour not in queue and neighbour not in path:
                queue.append(neighbour)
        path.append(queue.pop(0))
    return path


def depth_first_search(start_node, graph_dict):
    """
    Parcours en profondeur
    """
    if start_node not in graph_dict.keys():
        raise RuntimeError("Node not in graph")
    stack = [start_node]
    already_crossed = []
    # Tant que la pile n'est pas vide, on dépile un noeud et on ajouter ses voisins à la pile
    while stack:
        current_node = stack.pop()
        already_crossed.append(current_node)
        for neighbour in graph_dict[current_node]:
            if neighbour not in stack and neighbour not in already_crossed:
                stack.append(neighbour)
    return already_crossed


def min_node_in_queue(queue, distances):
    """
    Recupere le noeud de la pile ayant la plus petite distance par rapport au noeud d'origine
    """
    min_node = None
    min_distance = math.inf
    # On parcours la pile à la recherche à la recherche du maximum,
    # (algorithme classique de recherche de maximum en O(n))
    for node in queue:
        if distances[node] < min_distance:
            min_distance = distances[node]
            min_node = node
    return min_node


def dijkstra(graph, start_node_id, end_node_id):
    if start_node_id not in graph.keys():
        raise RuntimeError("Start node not in graph")
    if end_node_id not in graph.keys():
        raise RuntimeError("End node not in graph")

    distances = {}
    # Dictionnaire permettant de stocker pour chaque noeud A le noeud B
    # qui à provoqué la dernière mise à jour de distance du noeud A, soit {A: B}
    # (nécessaire pour retrouver le chemin final)
    previous = {}
    queue = []

    # Initialiser les noeuds et les distances
    for node in graph.keys():
        distances[node] = math.inf
        previous[node] = None
        queue.append(node)
    distances[start_node_id] = 0

    while queue:
        # Sélectionner le noeud non parcouru ayant la plus petite distance par rapport à l'origine
        current_node = min_node_in_queue(queue, distances)
        queue.remove(current_node)

        # Si le noeud courant est le noeud d'arrivée,
        # utiliser le dico previous pour retrouver le chemin final (par itération inverse)
        if current_node == end_node_id:
            path = []
            if previous[current_node] or current_node == start_node_id:
                while current_node:
                    path.insert(0, current_node)
                    current_node = previous[current_node]
            return path

        # Pour chaque voisin du noeud en cours,
        # mettre à jour sa distance par rapport au noeud d'origine
        for current_neighbour in graph[current_node].keys():
            new_distance = (
                distances[current_node] + graph[current_node][current_neighbour]
            )
            if new_distance < distances[current_neighbour]:
                distances[current_neighbour] = new_distance
                previous[current_neighbour] = current_node


def export_to_matrix(nodes, relations):
    """Exporte une liste de relations et de noeuds vers une matrice d'adjacence"""
    # On génère une liste contenant les ids des noeuds
    node_ids = [node[0] for node in nodes]
    # On génère une liste contenant les noms des noeuds
    node_names = [node[1] for node in nodes]
    n = len(nodes)
    matrix = [[0] * n for _ in range(n)]
    # Pour chaque relation
    for start_id, end_id, oriented, _ in relations:
        # On récupère l'id du noeud de départ
        target_start_node = node_ids.index(start_id)
        # On récupère l'id du noeud d'arrivée
        target_end_node = node_ids.index(end_id)

        # On met à 1 la bonne colonne
        matrix[target_start_node][target_end_node] = 1
        if not oriented:
            # Si la relation n'est pas orientée on met à 1 la colonne symétriquement opposée
            matrix[target_end_node][target_start_node] = 1
    return matrix, node_names
