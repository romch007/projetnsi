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
    while len(queue) != 0:
        s = queue.pop(0)
        path.append(s)
        for neighbour in grap_dict[s]:
            if neighbour not in queue:
                queue.append(neighbour)
    return path


def depth_first_search(start_node, graph_dict):
    """
    Parcours en profondeur
    """
    if start_node not in graph_dict.keys():
        raise RuntimeError("Node not in graph")
    stack = [start_node]
    already_crossed = []
    while len(stack) != 0:
        s = stack.pop()
        already_crossed.append(s)
        for neighbour in graph_dict[s]:
            if neighbour not in stack and neighbour not in already_crossed:
                stack.append(neighbour)
    return already_crossed


def dijkstra(graph_w_dict, start_node_id, end_node_id):
    pass
