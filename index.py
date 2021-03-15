from storage import Storage
from flask import Flask
app = Flask("projetnsi")

storage = Storage("data.sqlite")

@app.route("/health", methods=["GET"])
def health():
    return "ok"

@app.route("/createnode", methods=["POST"])
def create_node():
    return "not implemented"

@app.route("/createrelation", methods=["POST"])
def create_relation():
    return "not implemented"



