import unittest

from src.algo import (
    create_dict,
    create_weighted_dict,
    breadth_first_search,
    depth_first_search,
    dijkstra,
    min_node_in_queue,
    export_to_matrix,
)


class TestAlgo(unittest.TestCase):
    def test_create_dict(self):
        nodes = [[1, "A"], [2, "B"], [3, "C"], [4, "D"]]
        relations = [
            [1, 2, True, 1],
            [2, 4, False, 1],
            [2, 3, True, 1],
            [3, 4, False, 1],
        ]
        graph_dict = {1: [2], 2: [4, 3], 3: [4], 4: [2, 3]}
        result = create_dict(nodes, relations)
        self.assertDictEqual(graph_dict, result)

    def test_create_weighted_dict(self):
        nodes = [[1, "A"], [2, "B"], [3, "C"], [4, "D"]]
        relations = [
            [1, 2, True, 5],
            [2, 4, False, 4],
            [2, 3, True, 2],
            [3, 4, False, 10],
        ]
        graph_dict = {1: {2: 5}, 2: {4: 4, 3: 2}, 3: {4: 10}, 4: {2: 4, 3: 10}}
        result = create_weighted_dict(nodes, relations)
        self.assertDictEqual(graph_dict, result)

    def test_bfs(self):
        graph = {
            "A": ["B", "C", "E"],
            "B": ["D", "F"],
            "C": ["G"],
            "D": [],
            "E": ["F"],
            "F": [],
            "G": [],
        }
        expected_result = ["A", "B", "C", "E", "D", "F", "G"]
        result = breadth_first_search("A", graph)
        self.assertListEqual(expected_result, result)

    def test_bfs_raise_error(self):
        graph = {"A": ["B"], "B": []}
        with self.assertRaises(RuntimeError):
            breadth_first_search("C", graph)

    def test_dfs(self):
        graph = {
            "A": ("B", "D", "E"),
            "B": ("A", "C"),
            "C": ("B", "D"),
            "D": ("A", "C", "E"),
            "E": ("A", "D", "F", "G"),
            "F": ("E", "G"),
            "G": ("E", "F", "H"),
            "H": ("G"),
        }
        expected_result = ["A", "E", "G", "H", "F", "D", "C", "B"]
        result = depth_first_search("A", graph)
        self.assertListEqual(expected_result, result)

    def test_dfs_raise_error(self):
        graph = {"A": ["B"], "B": []}
        with self.assertRaises(RuntimeError):
            depth_first_search("C", graph)

    def test_dijkstra(self):
        g = {
            "1": {"3": 1, "2": 1},
            "2": {"1": 1, "3": 3, "6": 10},
            "3": {"1": 1, "2": 3, "4": 2, "5": 4},
            "4": {"3": 2, "6": 4},
            "5": {"3": 4, "6": 3},
            "6": {"2": 10, "5": 3, "4": 4},
        }
        expected_result = ["1", "3", "4", "6"]
        result = dijkstra(g, "1", "6")
        self.assertListEqual(expected_result, result)

    def test_dijkstra_start_node_raise_error(self):
        g = {
            "1": {"3": 1, "2": 1},
            "2": {"1": 1, "3": 3, "6": 10},
            "3": {"1": 1, "2": 3, "4": 2, "5": 4},
            "4": {"3": 2, "6": 4},
            "5": {"3": 4, "6": 3},
            "6": {"2": 10, "5": 3, "4": 4},
        }
        with self.assertRaises(RuntimeError):
            dijkstra(g, "7", "6")

    def test_dijkstra_end_node_raise_error(self):
        g = {
            "1": {"3": 1, "2": 1},
            "2": {"1": 1, "3": 3, "6": 10},
            "3": {"1": 1, "2": 3, "4": 2, "5": 4},
            "4": {"3": 2, "6": 4},
            "5": {"3": 4, "6": 3},
            "6": {"2": 10, "5": 3, "4": 4},
        }
        with self.assertRaises(RuntimeError):
            dijkstra(g, "1", "10")

    def test_min_node_in_queue(self):
        distances = {"A": 4, "B": 5, "C": 9, "D": 3}
        queue = ["A", "B", "C", "D"]
        result = min_node_in_queue(queue, distances)
        expected_result = "D"
        self.assertEqual(expected_result, result)

    def test_export_to_matrix(self):
        nodes = [
            (31, "1", 0, 0),
            (32, "2", 0, 0),
            (33, "3", 0, 0),
            (34, "4", 0, 0),
        ]
        relations = [
            (32, 31, True, 1),
            (33, 32, True, 1),
            (33, 34, True, 1),
            (31, 34, True, 1),
            (34, 32, True, 1),
            (31, 33, True, 1),
        ]
        matrix = [
            [0, 0, 1, 1],
            [1, 0, 0, 0],
            [0, 1, 0, 1],
            [0, 1, 0, 0],
        ]
        matrix_result, _ = export_to_matrix(nodes, relations)
        self.assertEqual(matrix, matrix_result)


if __name__ == "__main__":
    unittest.main()
