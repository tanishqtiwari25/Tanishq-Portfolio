"""Topology-preserving garment refinement; input is the original outfit .blend.

No facial likeness is generated. This pass treats the raised hood as cloth,
with a narrower neck, flattened crown, draped back and localized tension folds.
"""
import bpy
import math
import json
import tempfile
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'art/tt-arena/performer/refined'
OUT.mkdir(parents=True, exist_ok=True)
tempfile.tempdir = str(OUT / 'export-temp')
Path(tempfile.tempdir).mkdir(exist_ok=True)
mesh = bpy.data.meshes['TT_Garment_Surface']
assert len(mesh.vertices) == 7000, 'Unexpected source topology; abort rather than edit another asset'
before = [tuple(v.co) for v in mesh.vertices]
faces = [tuple(p.vertices) for p in mesh.polygons]

for i, vertex in enumerate(mesh.vertices):
    x, depth, height = before[i]
    if 420 <= i < 1094:
        # The hood is not a perfect ellipsoid: taper toward the neck and
        # flatten the crown, with cloth hanging further behind the shoulders.
        t = max(0, min(1, (height - 1.385) / .45))
        angle = math.atan2(depth - .012, x)
        width = .72 + .22 * math.sin(math.pi * t) ** .65
        x *= width
        depth = .012 + (depth - .012) * (.78 + .16 * t)
        height = 1.41 + .377 * t
        height -= .022 * max(0, (t - .78) / .22) ** 2
        crease = .004 * math.sin(angle * 5 + t * 8) * math.sin(math.pi * t)
        x += crease * math.cos(angle)
        depth += crease * math.sin(angle)
    elif 1408 <= i < 1770:
        x *= .8
        depth = -.1 + (depth + .135) * .6
        height = 1.61 + (height - 1.61) * .8
    elif i < 290:
        # Broad oblique tension folds, strongest at the lower back and waist.
        t = max(0, min(1, (height - .88) / .59))
        envelope = math.sin(math.pi * t) ** 2
        angle = math.atan2(depth, x)
        fold = .009 * envelope * math.sin(t * 19 + angle * 2.4)
        x += fold * math.cos(angle)
        depth += fold * math.sin(angle)
    vertex.co = (x, depth, height)
mesh.update()

# Independent numeric QA, using plain tuples after documented mesh reads.
after = [tuple(v.co) for v in mesh.vertices]
edges = Counter()
min_area = float('inf')
for face in faces:
    for a, b in zip(face, face[1:] + face[:1]):
        edges[tuple(sorted((a, b)))] += 1
    a = after[face[0]]
    for j in range(1, len(face) - 1):
        u = [after[face[j]][k] - a[k] for k in range(3)]
        v = [after[face[j + 1]][k] - a[k] for k in range(3)]
        cross = (u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0])
        min_area = min(min_area, .5 * math.sqrt(sum(n*n for n in cross)))
qa = {'vertices': len(after), 'triangles': sum(len(f)-2 for f in faces),
      'boundary_or_nonmanifold_edges': sum(n != 2 for n in edges.values()),
      'minimum_triangle_area_m2': min_area,
      'finite_coordinates': all(math.isfinite(c) for v in after for c in v),
      'topology_unchanged': faces == [tuple(p.vertices) for p in mesh.polygons],
      'accepted_warning': 'Existing overlapping UVs intentionally tile fabric; not a unique bake atlas.',
      'facial_likeness': False}
assert qa['boundary_or_nonmanifold_edges'] == 0 and qa['finite_coordinates'] and min_area > 1e-9
(OUT / 'topology-qa.json').write_text(json.dumps(qa, indent=2))
assert 'FINISHED' in bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'tt-entrance-refined.blend'))
assert 'FINISHED' in bpy.ops.export_scene.gltf(filepath=str(ROOT / 'public/models/tt-entrance-refined.glb'), export_format='GLB', export_animation_mode='ACTIONS', export_meshopt_compression_enable=True)
print('GARMENT_QA', json.dumps(qa), flush=True)
