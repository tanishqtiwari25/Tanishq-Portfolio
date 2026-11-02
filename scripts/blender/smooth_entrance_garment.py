"""Non-destructive curvature study. Load the refined outfit before execution."""
import bpy
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'art/tt-arena/performer/curvature'
OUT.mkdir(parents=True, exist_ok=True)
tempfile.tempdir = str(OUT / 'export-temp')
Path(tempfile.tempdir).mkdir(exist_ok=True)
garment = bpy.data.objects['SK_TT_Entrance_Outfit']
smooth = garment.modifiers.new('Garment surface curvature', 'SUBSURF')
smooth.subdivision_type = 'CATMULL_CLARK'
smooth.levels = 1
smooth.render_levels = 1
assert 'FINISHED' in bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'tt-entrance-curvature.blend'))
assert 'FINISHED' in bpy.ops.export_scene.gltf(filepath=str(ROOT / 'public/models/tt-entrance-curvature.glb'), export_format='GLB', export_apply=True, export_animation_mode='ACTIONS', export_meshopt_compression_enable=False)
print('CURVATURE_EXPORT', (ROOT / 'public/models/tt-entrance-curvature.glb').stat().st_size, flush=True)
