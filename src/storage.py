import sqlite3

schema = [
    """
CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    x INTEGER,
    y INTEGER,
    color VARCHAR(255)
);
""",
    """
CREATE TABLE IF NOT EXISTS relations (
    start_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    end_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    oriented INTEGER DEFAULT 0,
    weight INTEGER DEFAULT 1
);
""",
]


class Storage:
    def __init__(self, filename):
        # On initialise la connection avec la base de données
        self.connection = sqlite3.connect(filename)
        cursor = self.connection.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")
        cursor.execute(schema[0])
        cursor.execute(schema[1])
        self.connection.commit()

    def get_nodes(self):
        """Récupère la liste des noeuds"""
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM nodes")
        result = cursor.fetchall()
        return result

    def get_node_by_name(self, name):
        """Récupère un noeud par son nom"""
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM nodes WHERE name = ?", (name,))
        result = cursor.fetchone()[0]
        return result

    def get_relations(self):
        """Récupère la liste des relations"""
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM relations")
        result = cursor.fetchall()
        return result

    def create_new_node(self, name, x, y, color):
        """Crée un nouveau noeud"""
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO nodes (name, x, y, color) VALUES (?, ?, ?, ?)",
            (name, x, y, color),
        )
        self.connection.commit()
        return cursor.lastrowid

    def create_many_nodes_by_id(self, nodes):
        """Crée plusieurs noeuds en spécifiant leur id"""
        cursor = self.connection.cursor()
        cursor.executemany(
            'INSERT INTO nodes (id, x, y, name, color) VALUES (?, ?, ?, ?, "grey")',
            nodes,
        )
        self.connection.commit()

    def create_many_nodes_by_name(self, names, coords):
        """Crée plusieurs noeuds en spécifiant leur nom"""
        cursor = self.connection.cursor()
        cursor.executemany(
            'INSERT INTO nodes (name, x, y, color) VALUES (?, ?, ?, "grey")',
            [(name, coords[0], coords[1]) for name in names],
        )
        self.connection.commit()

    def create_many_relations(self, relations):
        """Crée plusieurs relations"""
        cursor = self.connection.cursor()
        cursor.executemany(
            "INSERT INTO relations (start_id, end_id, oriented, weight) VALUES (?, ?, ?, ?)",
            relations,
        )
        self.connection.commit()

    def create_new_relation(self, start, end, oriented, weight):
        """Crée une nouvelle relations"""
        cursor = self.connection.cursor()
        oriented_int = 1 if oriented else 0
        cursor.execute(
            "INSERT INTO relations (start_id, end_id, oriented, weight) VALUES (?, ?, ?, ?)",
            (start, end, oriented_int, weight),
        )
        self.connection.commit()

    def update_node(self, node_id, name, x, y, color):
        """Met à jour un noeud"""
        cursor = self.connection.cursor()
        cursor.execute(
            "UPDATE nodes SET name = ?, x = ?, y = ?, color = ? WHERE id = ?",
            (name, x, y, color, node_id),
        )
        self.connection.commit()

    def update_relation(self, start_id, end_id, oriented, weight):
        """Met à jour une relation"""
        cursor = self.connection.cursor()
        oriented_int = 1 if oriented else 0
        cursor.execute(
            """UPDATE relations
            SET oriented = ?, weight = ?
            WHERE start_id = ?
            AND end_id = ?""",
            (oriented_int, weight, start_id, end_id),
        )
        self.connection.commit()

    def delete_node(self, node_id):
        """Supprime un noeud"""
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM nodes WHERE id = ?", (node_id,))
        cursor.execute(
            "DELETE FROM relations WHERE start_id = ? OR end_id = ?", (node_id, node_id)
        )
        self.connection.commit()

    def delete_relation(self, start_id, end_id):
        """Supprime une relation"""
        cursor = self.connection.cursor()
        cursor.execute(
            "DELETE FROM relations WHERE start_id = ? AND end_id = ?",
            (start_id, end_id),
        )
        self.connection.commit()

    def delete_all(self):
        """Supprime l'ensemble des données de la base"""
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM relations")
        cursor.execute("DELETE FROM nodes")
        self.connection.commit()
