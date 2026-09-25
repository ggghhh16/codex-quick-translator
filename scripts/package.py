"""Build and inspect an exact allowlisted bundle, excluding local state."""
from zipfile import ZipFile, ZIP_DEFLATED
from pathlib import Path
import hashlib
import importlib.util
import json
root = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('publication', root / 'scripts/check-publication.py')
publication = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publication)
files = publication.scan_worktree()
version = json.loads((root / 'package.json').read_text('utf-8'))['version']
output = root / 'dist' / f'codex-quick-translator-{version}.zip'
output.parent.mkdir(exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / name, 'codex-quick-translator/' + name)
publication.scan_zip(output)
digest = hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.zip.sha256').write_text(f'{digest}  {output.name}\n', encoding='utf-8')
print(f'{output.name}: {len(files)} files, {output.stat().st_size} bytes; SHA256 {digest}')
