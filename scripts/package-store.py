"""Build a Chrome Web Store ZIP: manifest at root, browser files only."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import importlib.util
import json

root = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('publication', root / 'scripts/check-publication.py')
publication = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publication)
files = [name for name in publication.scan_worktree() if name.startswith('extension/')]
manifest = json.loads((root/'extension/manifest.json').read_text('utf-8'))
manifest.pop('key', None)  # The store assigns its own item ID; the installer accepts that ID.
output = root/'dist'/f'codex-quick-translator-store-{manifest["version"]}.zip'
output.parent.mkdir(exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for file in files:
        name = file.removeprefix('extension/')
        data = (json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode('utf-8') if name=='manifest.json' else (root/file).read_bytes()
        archive.writestr(name,data)
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert sorted(archive.namelist()) == sorted(n.removeprefix('extension/') for n in files)
    actual=json.loads(archive.read('manifest.json'))
    assert 'key' not in actual and actual['manifest_version']==3
    assert set(actual['permissions'])=={'contextMenus','activeTab','scripting','nativeMessaging'}
    for name in archive.namelist():
        publication.check_bytes('extension/'+name,archive.read(name))
    assert all(name in archive.namelist() for name in actual['icons'].values())
digest=hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.zip.sha256').write_text(f'{digest}  {output.name}\n',encoding='utf-8')
print(f'{output.name}: {len(files)} browser files; SHA256 {digest}')
