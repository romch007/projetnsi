import math


def parse_gps(data_str):
    lines = data_str.split("\n")
    nodes_count, _ = map(int, lines[0].split())
    nodes = []
    for line in lines[2 : nodes_count + 2]:
        id_str, lat_str, lon_str, _, name = line.split("\t")
        nodes.append((int(id_str), float(lat_str), float(lon_str), name))

    relations = []
    for line in lines[nodes_count + 3 : -1]:
        start_id_str, end_id_str, weight_str = line.split("\t")
        relations.append((int(start_id_str), int(end_id_str), float(weight_str)))

    return nodes, relations


def convert_coords(lat, lon):
    R = 6371
    x = R * math.cos(lat) * math.cos(lon) * 0.1
    y = R * math.cos(lat) * math.sin(lon) * 0.1
    return x, y


def import_gps(db, text):
    db.delete_all()
    nodes, relations = parse_gps(text)

    db_nodes = []
    for node in nodes:
        x, y = convert_coords(node[1], node[2])
        db_nodes.append((node[0], x, y, node[3]))

    db_relations = []
    for relation in relations:
        db_relations.append((relation[0], relation[1], True, relation[2]))

    db.create_many_nodes_by_id(db_nodes)
    db.create_many_relations(db_relations)
