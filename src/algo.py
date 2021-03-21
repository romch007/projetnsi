import math


def create_dict(nodes, relations):
    result = {}
    for node in nodes:
        id = node[0]
        neighbours = []
        for relation in relations:
            start = relation[0]
            end = relation[1]
            oriented = relation[2] == 1
            if start == id:
                neighbours.append(end)
            elif end == id and not oriented:
                neighbours.append(start)
        result[id] = neighbours
    return result


def create_weighted_dict(nodes, relations):
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
    previous = {} # Dictionnaire permettant de stocker pour chaque noeud A le noeud B
                  # qui a provoque la derniere mise a jour de distance du noeud A, soit {A: B}
                  # (necessaire pour retrouver le chemin final)
    queue = []

    # Initialiser les noeuds et les distances
    for node in graph.keys():
        distances[node] = math.inf
        previous[node] = None
        queue.append(node)
    distances[start_node_id] = 0

    while queue:
        current_node = min_node_in_queue(queue, distances) # Selectioner le noeud non parcouru
                                                           # ayant la plus petite distance par rapport a l'origine
        queue.remove(current_node)

        # Si le noeud courant est le noeud d'arrivee,
        # utiliser le dico previous pour retrouver le chemin final (par iteration inverse)
        if current_node == end_node_id:
            path = []
            if previous[current_node] or current_node == start_node_id:
                while current_node:
                    path.insert(0, current_node)
                    current_node = previous[current_node]
            return path

        # Pour chaque voisin du noeud en cours,
        # mettre a jour sa distance par rapport au noeud d'origine
        for current_neighbour in graph[current_node].keys():
            new_distance = (
                distances[current_node] + graph[current_node][current_neighbour]
            )
            if new_distance < distances[current_neighbour]:
                distances[current_neighbour] = new_distance
                previous[current_neighbour] = current_node
