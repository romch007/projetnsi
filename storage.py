import sqlite3

schema = [
    """
CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(255) NOT NULL
);
""",
    """
CREATE TABLE IF NOT EXISTS relations (
    start_id INTEGER REFERENCES nodes(id),
    end_id INTEGER REFERENCES nodes(id),
    oriented INTEGER DEFAULT 0,
    weight INTEGER DEFAULT 1
);
""",
]


class Storage:
    def __init__(self, filename: str):
        self.connection = sqlite3.connect(filename)
        cursor = self.connection.cursor()
        cursor.execute(schema[0])
        cursor.execute(schema[1])
        self.connection.commit()

    def get_nodes(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM nodes")
        result = cursor.fetchall()
        return result

    def get_relations(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM relations")
        result = cursor.fetchall()
        return result

    def create_new_node(self, key: str):
        cursor = self.connection.cursor()
        cursor.execute("INSERT INTO nodes (key) VALUES (?)", (key,))
        self.connection.commit()

    def create_new_relation(self, start: int, end: int, oriented: bool, weight: int):
        cursor = self.connection.cursor()
        oriented_int = 1 if oriented else 0
        cursor.execute(
            "INSERT INTO relations (start_id, end_id, oriented, weigh) VALUES (?, ?, ?, ?)", (start, end, oriented_int, weight)
        )
        self.connection.commit()
