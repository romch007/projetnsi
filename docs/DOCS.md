# Documentation

## Commandes relatives aux noeuds :

- `GET /getnodes`

Récupère la liste des noeuds, exemple de retour :

```json
[
  { "id": 1, "name": "A" },
  { "id": 2, "name": "B" }
]
```

- `POST /createnode/`

Crée un noeud, exemple de body :

```json
{ "name": "C" }
```

- `POST /updatenode/<id>`

Modifie un noeud en spécifiant l'id, exemple de body :

```json
{ "name": "nouveau_nom" }
```

- `POST /deletenode/<id>`

Supprime un noeud en spécifiant l'id.

## Commandes relatives aux relations :

- `GET /getrelations`

Récupère la liste des relations, exemple de retour :

```json
[
  { "start_id": 1, "end_id": 2, "oriented": false, "weight": 1 },
  { "start_id": 3, "end_id": 2, "oriented": false, "weight": 5 },
  { "start_id": 1, "end_id": 4, "oriented": true, "weight": 2 }
]
```

- `POST /createrelation`

Crée une relation, exemple de body :

```json
{
  "start_id": 1,
  "end_id": 5,
  "oriented": true,
  "weight": 1
}
```

- `POST /updaterelation/<start_id>/<end_id>`

Modifie une relation en spécifiant l'id du noeud de départ et l'id du noeud d'arrivée (permet seulement de modifier l'orientation et le poids de la relation), exemple de body :

```json
{
  "oriented": false,
  "weight": 5
}
```

- `POST /deleterelation/<start_id>/<end_id>`

Supprime une relation en spécifiant l'id du noeud de départ et l'id du noeud d'arrivée
