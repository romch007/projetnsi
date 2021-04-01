import unittest

from src.importsfn import eval_matrix


class TestImportsFn(unittest.TestCase):
    def test_eval_matrix_success(self):
        text = """[
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1]
]"""
        result = eval_matrix(text)
        expected = [[1, 0, 1], [0, 1, 0], [1, 0, 1]]
        self.assertEqual(result, expected)


if __name__ == "__main__":
    unittest.main()
