def create_dict(nodes, relations):
    result = {}
    for node in nodes:
        id = node[0]
        neighbours = []
        for relation in relations:
            start = relation[0]
            end = relation[1]
            if start == id:
                neighbours.append(end)
            elif end == id:
                neighbours.append(start)
        result[id] = neighbours
    return result

n = [[1, "name"], [2, "test"]]

r = [[1, 2, True, 6]]

print(create_dict(n, r))
