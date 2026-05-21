# Design System Quisi — Visual Balance

## Principes appliqués

### Gestalt
- **Proximité** : navigation groupée, stats groupées, formulaires en cartes
- **Similarité** : un seul style de bouton primaire (teal), secondaire outline
- **Figure-fond** : cartes `surface` sur fond `bg` avec ombre légère
- **Continuité** : flux Z sur la landing, F sur le dashboard

### Hiérarchie typographique
| Niveau | Usage | Taille |
|--------|-------|--------|
| 1 | Titres hero, CTA | 37–47px, Plus Jakarta 800 |
| 2 | Titres section | 24–30px |
| 3 | Corps, cartes | 16px Source Sans 3 |
| 4 | Labels, meta | 12–14px, opacité réduite |

### Couleurs 60-30-10
- **60%** : `#0a0c10`, `#0f1218` (fonds)
- **30%** : `#161b24`, `#1e2530` (cartes, sidebar)
- **10%** : `#2dd4bf` (CTA), `#fb7185` (alertes, accent)

### Équilibre
- Landing : asymétrique (texte gauche, mockup droite)
- Auth : panneau brand + formulaire
- Dashboard : hero + métriques latérales

### Espacement
- Sections : 80–96px (`--space-20` / `--space-24`)
- Cartes primaires : 32px padding
- CTA : 24px marge autour

## Fichiers
- `dashboard/src/styles/design-system.css` — tokens
- `mobile/src/styles/theme.ts` — tokens alignés
