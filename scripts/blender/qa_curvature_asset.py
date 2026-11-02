"""Run the reviewed installed QA helper against the loaded garment study."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HELPERS = Path('C:/Users/Tanishq Tiwari/.codex/skills/blender-asset-qa/scripts')
dependencies = {name: hashlib.sha256((HELPERS / name).read_bytes()).hexdigest()
                for name in ('qa_check.py', '_bpyx.py')}
sys.path.insert(0, str(HELPERS))
import qa_check

overlaps = []
def collect_overlap_locations(frame, event, arg):
    if event == 'call' and frame.f_code.co_name == '_describe':
        data = frame.f_back.f_locals
        for first, second in frame.f_locals['pairs']:
            overlaps.append({'triangles': [first, second], 'points': [
                [list(data['verts'][index]) for index in data['tris'][triangle]]
                for triangle in (first, second)]})
    return collect_overlap_locations
sys.settrace(collect_overlap_locations)
report = qa_check.run(objects=['SK_TT_Entrance_Outfit'], profile='game')
sys.settrace(None)
report['overlap_locations'] = overlaps
report['reviewed_helpers_sha256'] = dependencies
report['scope'] = 'Evaluated curvature garment; likeness and animation stress review are separate gates.'
output = ROOT / 'art/tt-arena/performer/curvature/full-asset-qa.json'
output.write_text(json.dumps(report, indent=2), encoding='utf-8')
print('ASSET_QA', report['pass'], report['errors'], report['warnings'], flush=True)
