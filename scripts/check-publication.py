"""Scan exact release files, Git index and ZIP bytes without printing secrets."""
from pathlib import Path, PurePosixPath
from zipfile import ZipFile
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
RULES = {
    'private key': r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----',
    'API token': r'\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})',
    'personal home path': r'[A-Z]:[\\/]+Users[\\/]+(?!Public\b|Default\b)[^\\/\s\"\']+[\\/]',
    'personal vault path': r'[A-Z]:[\\/]+Obsidian[\\/]',
    'email address': r'\b[A-Za-z0-9._%+-]+@(?:qq|gmail|outlook|hotmail)\.com\b',
}

def allowed_files():
    names = json.loads((ROOT / 'release-files.json').read_text('utf-8'))
    if len(names) != len(set(names)):
        raise ValueError('Duplicate release file')
    for name in names:
        p = PurePosixPath(name)
        if p.is_absolute() or '..' in p.parts or p.parts[0] in ('.local', '.dev', 'notes', 'dist', '.git'):
            raise ValueError('Unsafe release file name')
    return sorted(names)

def check_bytes(name, data):
    text = data.decode('utf-8')
    for label, pattern in RULES.items():
        if re.search(pattern, text, re.I):
            raise ValueError(f'{name}: possible {label}')

def scan_worktree():
    names = allowed_files()
    for name in names:
        file = ROOT / name
        if file.is_symlink() or file.stat().st_nlink > 1:
            raise ValueError(f'{name}: linked release file')
        if not file.resolve().is_relative_to(ROOT):
            raise ValueError(f'{name}: outside project')
        check_bytes(name, file.read_bytes())
    return names

def scan_index():
    names = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().strip('\0').split('\0')
    if sorted(names) != allowed_files():
        raise ValueError('Git index does not match the explicit release allowlist')
    for name in names:
        data = subprocess.check_output(['git', 'show', ':' + name], cwd=ROOT)
        check_bytes(name, data)
        if data.replace(b'\r\n', b'\n') != (ROOT / name).read_bytes().replace(b'\r\n', b'\n'):
            raise ValueError(f'{name}: staged content differs from worktree')

def scan_zip(file):
    with ZipFile(file) as archive:
        if archive.testzip() is not None:
            raise ValueError('ZIP integrity error')
        expected = ['codex-quick-translator/' + n for n in allowed_files()]
        if sorted(archive.namelist()) != sorted(expected):
            raise ValueError('ZIP does not match the explicit release allowlist')
        for name in archive.namelist():
            check_bytes(name, archive.read(name))

if __name__ == '__main__':
    try:
        names = scan_worktree()
        if '--index' in sys.argv:
            scan_index()
        if '--zip' in sys.argv:
            scan_zip(Path(sys.argv[sys.argv.index('--zip') + 1]))
        print(f'Publication scan passed: {len(names)} allowlisted files')
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
