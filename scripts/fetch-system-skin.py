import io,urllib.request,zipfile,json
URL='https://files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip'
class Remote(io.RawIOBase):
 def __init__(self): self.pos=0;self.size=280737770
 def seek(self,n,whence=0): self.pos=n if whence==0 else self.pos+n if whence==1 else self.size+n;return self.pos
 def tell(self): return self.pos
 def read(self,n=-1):
  n=min(n if n>=0 else self.size-self.pos,self.size-self.pos)
  if not n:return b''
  req=urllib.request.Request(URL,headers={'Range':f'bytes={self.pos}-{self.pos+n-1}'})
  with urllib.request.urlopen(req,timeout=60) as response:
   if response.status!=206:raise RuntimeError('Range request was not honoured')
   b=response.read()
  self.pos+=len(b);return b
from pathlib import Path
import concurrent.futures
original_read=Remote.read
def faster_read(self,n=-1):
 n=min(n if n>=0 else self.size-self.pos,self.size-self.pos)
 if n<262144:return original_read(self,n)
 start=self.pos
 def get(offset):
  end=min(start+n,offset+262144)
  req=urllib.request.Request(URL,headers={'Range':f'bytes={offset}-{end-1}'})
  with urllib.request.urlopen(req,timeout=60) as r:
   if r.status!=206:raise RuntimeError('No range support')
   return r.read()
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: data=b''.join(pool.map(get,range(start,start+n,262144)))
 self.pos+=len(data);return data
Remote.read=faster_read
# Explicitly selected official data only. No downloaded Python or Blender add-ons are executed.
import hashlib
with zipfile.ZipFile(Remote()) as archive:
 names=archive.namelist()
 wanted=[n for n in names if
   (n.startswith('skins/young_asian_male/') and n.endswith(('.png','.mhmat'))) or
   n=='skins/middleage_asian_male/middleage_lightskinned_male_diffuse2.png' or
   n in ('eyes/low-poly/low-poly.obj','eyes/low-poly/low-poly.mhclo','eyes/materials/brown_eye.png','eyes/materials/brown.mhmat') or
   (n.startswith('clothes/male_casualsuit05/') and not n.endswith('/'))]
 out=Path('art/tt-arena/reconstruction/vendor/system-selected');out.mkdir(exist_ok=True)
 provenance=[]
 for name in wanted:
  path=out/Path(name).name
  if not path.exists():path.write_bytes(archive.read(name))
  info=archive.getinfo(name)
  if path.stat().st_size!=info.file_size:raise RuntimeError('Incomplete asset: '+name)
  provenance.append({'entry':name,'bytes':info.file_size,'crc32':format(info.CRC,'08x'),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
 (out/'source.json').write_text(json.dumps({'url':URL,'zip_bytes':280737770,'license':'CC0','page':'https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html','entries':provenance},indent=2))
 print('Selected official CC0 files verified:',len(provenance),flush=True)
