"""Read untrusted artifact data without extracting or executing it."""
import base64
import json
import re
import stat
import sys
import zipfile

LIMIT = 100 * 1024 * 1024
PATTERN = re.compile(r'(light|dark)/[a-z0-9][a-z0-9_-]*-chromium-linux\.png', re.ASCII)


def validate(archive):
    images = []
    seen = set()
    total = 0
    with zipfile.ZipFile(archive) as bundle:
        if not 1 <= len(bundle.infolist()) <= 2000:
            raise ValueError('Unexpected number of artifact entries')
        for entry in bundle.infolist():
            mode = entry.external_attr >> 16
            if (not PATTERN.fullmatch(entry.filename) or entry.filename in seen
                    or stat.S_IFMT(mode) not in (0, stat.S_IFREG)):
                raise ValueError('Unexpected snapshot path or file type')
            total += entry.file_size
            if not 0 < entry.file_size <= 10 * 1024 * 1024 or total > LIMIT:
                raise ValueError('Snapshot size limit exceeded')
            data = bundle.read(entry)
            if (not data.startswith(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR')
                    or not data.endswith(b'\x00\x00\x00\x00IEND\xaeB`\x82')):
                raise ValueError('Expected PNG snapshot data')
            seen.add(entry.filename)
            images.append({'path': entry.filename, 'content': base64.b64encode(data).decode('ascii')})
    return images


if __name__ == '__main__':
    print(json.dumps(validate(sys.argv[1])))
