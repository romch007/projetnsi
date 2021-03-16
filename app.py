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
    result = get_db().get_nodes()
    json_result = [{"id": id, "name": name} for id, name in result]
    return jsonify(json_result)

@app.route("/getrelations", methods=["GET"])
def get_relations():
    result = get_db().get_relations()
    json_result = [{
        "start_id": start,
        "end_id": end,
        "oriented": oriented == 1,
        "weight": weight
    } for start, end, oriented, weight in result]
    return jsonify(json_result)

@app.route("/createnode", methods=["POST"])
def create_node():
    content = request.get_json()
    node_name = content["name"]
    get_db().create_new_node(node_name)
    return "ok"

@app.route("/createrelation", methods=["POST"])
def create_relation():
    content = request.get_json()
    start_id = content["start_id"]
    end_id = content["end_id"]
    oriented = content["oriented"]
    weight = content["weight"]
    get_db().create_new_relation(start_id, end_id, oriented, weight)
    return "ok"
