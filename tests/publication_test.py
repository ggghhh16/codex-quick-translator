import importlib.util
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

root = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('publication', root / 'scripts/check-publication.py')
publication = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publication)

class PublicationTests(unittest.TestCase):
    def test_secret_signatures_fail_without_echoing_secret(self):
        token = 'gh' + 'p_' + 'A' * 36
        with self.assertRaises(ValueError) as caught:
            publication.check_bytes('test.txt', token.encode())
        self.assertNotIn(token, str(caught.exception))

    def test_private_paths_are_rejected(self):
        for value in ['C:' + '/Users/Example/private/config', 'D:' + '/Obsidian/personal/notes']:
            with self.assertRaises(ValueError):
                publication.check_bytes('fixture', value.encode())

    def test_unexpected_zip_entry_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            file = Path(folder) / 'bad.zip'
            with ZipFile(file, 'w') as archive:
                archive.writestr('codex-quick-translator/.local/config.json', '{}')
            with self.assertRaises(ValueError):
                publication.scan_zip(file)

if __name__ == '__main__':
    unittest.main()
