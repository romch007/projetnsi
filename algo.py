def create_dict(nodes, relations):
    result = {}
    for node in nodes:
        id = node[0]
        neighbours = []
        for start, end in relations:
            if start == id:
                neighbours.append(end)
            elif end == id:
                neighbours.append(start)
        result[id] = neighbours
    return result
