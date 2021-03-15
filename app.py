from storage import Storage
from flask import Flask, g, jsonify, request

app = Flask("projetnsi")

def get_db():
    if 'db' not in g:
        g.db = Storage("data.sqlite")
    return g.db

@app.teardown_appcontext
def teardown_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.connection.close()

@app.route("/health", methods=["GET"])
def health():
    return "ok"

@app.route("/getnodes", methods=["GET"])
def get_nodes():
    nodes_result = get_db().get_nodes()
    json_result = []
    for id, name in nodes_result:
        json_result.append({"id": id, "name": name})
    return jsonify(json_result)

@app.route("/getrelations", methods=["GET"])
def get_relations():
    relations_result = get_db().get_relations()
    return jsonify(relations_result)

@app.route("/createnode", methods=["POST"])
def create_node():
    content = request.get_json()
    node_name = content["name"]
    get_db().create_new_node(node_name)
    return "ok"

@app.route("/createrelation", methods=["POST"])
def create_relation():
    content = request.get_json()
    start_id = content["start"]
    end_id = content["end"]
    oriented = content["oriented"]
    weight = content["weight"]
    get_db().create_new_relation(start_id, end_id, oriented, weight)
    return "ok"

