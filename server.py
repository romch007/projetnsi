from bottle import route, run, get, post, request, install
from storage import Storage

storage = Storage("data.sqlite")

storage.create_new_relation(1, 2)


@get("/select")
def select():
    return "Hey"


@post("/createnode")
def createnode():
    body = request.json
    storage.create_new_node(body.get("name"))
    return "created"


@post("/createrelation")
def createrelation():
    print(request.json)


def start_http_server(host: str, port: int):
    run(host=host, port=port)
