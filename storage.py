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
    left_id INTEGER REFERENCES nodes(id),
    right_id INTEGER REFERENCES nodes(id),
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

    def create_new_node(self, key: str):
        cursor = self.connection.cursor()
        cursor.execute("INSERT INTO nodes (key) VALUES (?)", (key))
        self.connection.commit()

    def create_new_relation(self, right: int, left: int):
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO relations (right_id, left_id) VALUES (?, ?)", (right, left)
        )
        self.connection.commit()
