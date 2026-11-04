import bpy, bmesh, sys
from mathutils.bvhtree import BVHTree
sys.path.insert(0,r'C:\Users\Tanishq Tiwari\.codex\skills\blender-asset-qa\scripts')
from qa_check import _point_in_tri
ob=bpy.data.objects['SK_TT_Entrance_Outfit'];dg=bpy.context.evaluated_depsgraph_get();eo=ob.evaluated_get(dg);me=eo.to_mesh();bm=bmesh.new();bm.from_mesh(me);bmesh.ops.triangulate(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free();me.calc_loop_triangles()
vs=[v.co.copy() for v in me.vertices];ts=[tuple(t.vertices) for t in me.loop_triangles];normals=[(vs[t[1]]-vs[t[0]]).cross(vs[t[2]]-vs[t[0]]).normalized() for t in ts];bvh=BVHTree.FromPolygons(vs,ts);pairs=set()
for i,t in enumerate(ts):
    a,b,c=[vs[k] for k in t];n=normals[i];cen=(a+b+c)/3
    for p in (cen,cen.lerp(a,.6),cen.lerp(b,.6),cen.lerp(c,.6)):
        for _,_,j,_ in bvh.find_nearest_range(p,.001):
            if j==i or set(t)&set(ts[j]) or n.dot(normals[j])<.999:continue
            a2,b2,c2=[vs[k] for k in ts[j]];q=p-normals[j]*normals[j].dot(p-a2)
            if _point_in_tri(q,a2,b2,c2,normals[j]):pairs.add(tuple(sorted((i,j))))
for i,j in sorted(pairs):print('COPLANAR',i,j,'center',tuple(round(v,4) for v in sum((vs[k] for k in ts[i]),start=vs[ts[i][0]]*0)/3),'materials',me.loop_triangles[i].material_index,me.loop_triangles[j].material_index)
eo.to_mesh_clear()
