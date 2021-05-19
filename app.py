import os
from flask import Flask, g, jsonify, request
from src.storage import Storage
from src.algo import (
    create_dict,
    create_weighted_dict,
    breadth_first_search,
    depth_first_search,
    dijkstra,
    export_to_matrix,
)
from src.importsfn import import_data_from_matrix
from src.gpsparser import import_gps

# On crée l'instance du serveur HTTP en précisant l'emplacement des ressources statiques
app = Flask(__name__, static_url_path="", static_folder="static")


def get_db():
    """Permet d'instancier un objet Storage global la première fois qu'on l'utilise"""
    if "db" not in g:
        # On récupère le nom de fichier dans la variable d'environnement STORAGE sinon
        # on prend le fichier data.sqlite
        filename = os.getenv("STORAGE") or "data.sqlite"
        g.db = Storage(filename)
    return g.db


@app.teardown_appcontext
def teardown_db(exception):
    """Permet de fermet la connection à la base de données lorsque le serveur HTTP est arreté"""
    db = g.pop("db", None)
    if db is not None:
        db.connection.close()


@app.route("/")
def root():
    """Permet de servir index.html à l'url /"""
    return app.send_static_file("index.html")


@app.route("/health", methods=["GET"])
def health():
    return "ok"


@app.route("/getnodes", methods=["GET"])
def get_nodes():
    result = get_db().get_nodes()
    # On formatte les données sous forme de dictionnaire pour les envoyer
    json_result = [
        {"id": id, "name": name, "x": x, "y": y, "color": color}
        for id, name, x, y, color in result
    ]
    return jsonify(json_result)


@app.route("/getrelations", methods=["GET"])
def get_relations():
    result = get_db().get_relations()
    # On formatte les données sous forme de dictionnaire pour les envoyer
    json_result = [
        {"start_id": start, "end_id": end, "oriented": oriented == 1, "weight": weight}
        for start, end, oriented, weight in result
    ]
    return jsonify(json_result)


@app.route("/createnode", methods=["POST"])
def create_node():
    # On récupère les données du corps de la requête post
    content = request.get_json()
    node_name = content["name"]
    node_x = content["x"]
    node_y = content["y"]
    node_color = content["color"]
    node_id = get_db().create_new_node(node_name, node_x, node_y, node_color)
    # On renvoie seulement l'id
    return jsonify({"id": node_id})


@app.route("/createrelation", methods=["POST"])
def create_relation():
    # On récupère les données du corps de la requête post
    content = request.get_json()
    start_id = content["start_id"]
    end_id = content["end_id"]
    oriented = content["oriented"]
    weight = content["weight"]
    get_db().create_new_relation(start_id, end_id, oriented, weight)
    return "ok"


@app.route("/updatenode/<int:node_id>", methods=["POST"])
def update_node(node_id):
    content = request.get_json()
    # On récupère les données du corps de la requête post
    name = content["name"]
    x = content["x"]
    y = content["y"]
    color = content["color"]
    get_db().update_node(node_id, name, x, y, color)
    return "ok"


@app.route("/updaterelation/<int:start_id>/<int:end_id>", methods=["POST"])
def update_relation(start_id, end_id):
    content = request.get_json()
    # On récupère les données du corps de la requête post
    oriented = content["oriented"]
    weight = content["weight"]
    get_db().update_relation(start_id, end_id, oriented, weight)
    return "ok"


@app.route("/deletenode/<int:node_id>", methods=["POST"])
def delete_node(node_id):
    get_db().delete_node(node_id)
    return "ok"


@app.route("/deleterelation/<int:start_id>/<int:end_id>", methods=["POST"])
def delete_relation(start_id, end_id):
    get_db().delete_relation(start_id, end_id)
    return "ok"


@app.route("/bfs/<int:start_node_id>", methods=["GET"])
def bfs(start_node_id):
    nodes = get_db().get_nodes()
    relations = get_db().get_relations()
    # On crée la liste d'adjancence à partir de la base de données
    graph_dict = create_dict(nodes, relations)
    # On lance l'algorithme et on renvoie le résultat
    result = breadth_first_search(start_node_id, graph_dict)
    return jsonify(result)


@app.route("/dfs/<int:start_node_id>", methods=["GET"])
def dfs(start_node_id):
    nodes = get_db().get_nodes()
    relations = get_db().get_relations()
    # On crée la liste d'adjancence à partir de la base de données
    graph_dict = create_dict(nodes, relations)
    # On lance l'algorithme et on renvoie le résultat
    result = depth_first_search(start_node_id, graph_dict)
    return jsonify(result)


@app.route("/dijkstra/<int:start_node_id>/<int:end_node_id>", methods=["GET"])
def dijkstra_route(start_node_id, end_node_id):
    nodes = get_db().get_nodes()
    relations = get_db().get_relations()
    # On crée la liste d'adjancence à partir de la base de données
    graph_weighted_dict = create_weighted_dict(nodes, relations)
    # On lance l'algorithme et on renvoie le résultat
    result = dijkstra(graph_weighted_dict, start_node_id, end_node_id)
    return jsonify(result)


@app.route("/import/matrix", methods=["POST"])
def import_matrix():
    # On récupère les données du corps de la requête post
    content = request.get_json()
    text = content["text"]
    names = content["names"]
    x = content["x"]
    y = content["y"]
    import_data_from_matrix(get_db(), names, text, (x, y))
    return "ok"


@app.route("/import/gps", methods=["POST"])
def import_gps_():
    content = request.get_data().decode("utf-8")
    import_gps(get_db(), content)
    return "ok"


@app.route("/export/matrix", methods=["GET"])
def export_matrix():
    nodes = get_db().get_nodes()
    relations = get_db().get_relations()
    # On génère la matrice à partir de la base de données
    matrix, names = export_to_matrix(nodes, relations)
    # On formatte le résultat puis on le renvoie
    result = {"matrix": matrix, "names": names}
    return jsonify(result)


@app.route("/export/list", methods=["GET"])
def export_list():
    nodes = get_db().get_nodes()
    relations = get_db().get_relations()
    # On génère la matrice à partir de la base de données
    graph_dict = create_dict(nodes, relations)
    # On formatte le résultat puis on le renvoie
    return jsonify(graph_dict)


if __name__ == "__main__":
    app.run(port=5555)
