from storage import Storage
from flask import Flask, g, jsonify

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
    return jsonify(nodes_result)

@app.route("/getrelations", methods=["GET"])
def get_relations():
    relations_result = get_db().get_relations()
    return jsonify(relations_result)

@app.route("/createnode", methods=["POST"])
def create_node():
    return "not implemented"

@app.route("/createrelation", methods=["POST"])
def create_relation():
    return "not implemented"

