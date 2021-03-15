from bottle import route, run, get, post


@get("/select")
def select():
    return "Hey"


@post("/create")
def create():
    return "Hey"


def startHTTPserver(host: str, port: int):
    run(host=host, port=port)
