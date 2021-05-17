import unittest

from src.gpsparser import parse_gps


class TestImportsFn(unittest.TestCase):
    def test_parse_gps(self):
        text = """8 12
Sommets du graphe
0 0.5	0.95	M1	Aaa
1 0.1	0.7	M1	Baa
2 0.5	0.7	M1	Caa
3 0.9	0.7	M1	Daa
4 0.1	0.35	M1	Eaa
5 0.5	0.35	M1	Faa
6 0.9	0.35	M1	Gaa
7 0.1	0.05	M1	Haa
ArÃªtes du grapheÂ : noeud1 noeud2 valeur
0 1 5
0 2 20
0 3 40
1 2 10
1 4 7
1 5 20
2 3 10
2 5 10
4 5 10
4 7 40
6 5 20
7 5 10
"""
        result = parse_gps(text)
        expected = (
            [
                (0, 0.5, 0.95, "Aaa"),
                (1, 0.1, 0.7, "Baa"),
                (2, 0.5, 0.7, "Caa"),
                (3, 0.9, 0.7, "Daa"),
                (4, 0.1, 0.35, "Eaa"),
                (5, 0.5, 0.35, "Faa"),
                (6, 0.9, 0.35, "Gaa"),
                (7, 0.1, 0.05, "Haa"),
            ],
            [
                [0, 1, 5],
                [0, 2, 20],
                [0, 3, 40],
                [1, 2, 10],
                [1, 4, 7],
                [1, 5, 20],
                [2, 3, 10],
                [2, 5, 10],
                [4, 5, 10],
                [4, 7, 40],
                [6, 5, 20],
                [7, 5, 10],
            ],
        )
        self.assertEqual(expected, result)


if __name__ == "__main__":
    unittest.main()
