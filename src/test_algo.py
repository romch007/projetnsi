import unittest

from algo import (
    create_dict,
    create_weighted_dict,
    breadth_first_search,
    depth_first_search,
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
        self.assertEqual(expected_result, result)

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
        self.assertEqual(expected_result, result)

    def test_dfs_raise_error(self):
        graph = {"A": ["B"], "B": []}
        with self.assertRaises(RuntimeError):
            depth_first_search("C", graph)


if __name__ == "__main__":
    unittest.main()
