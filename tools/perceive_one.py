import json, pathlib, shutil, struct, subprocess, sys
args = sys.argv[2:] or []
root = pathlib.Path(__file__).resolve().parent.parent
exe = root / 'qa/vision-tools/llama-mtmd-cli.exe'
model = pathlib.Path('D:/Apps/models/vlm/SmolVLM2-2.2B-Instruct-Q4_K_M.gguf')
proj = pathlib.Path('D:/Apps/models/vlm/mmproj-SmolVLM2-2.2B-Instruct-Q8_0.gguf')
prompt = sys.argv[1] if len(sys.argv) > 1 else 'Describe what this screen shows, including any visible text. Is it a game, an error page, or blank?'
for name in args:
    path = pathlib.Path(name)
    small = path.with_name(path.stem + '-vision.jpg')
    subprocess.run([shutil.which('ffmpeg'), '-y', '-i', str(path), '-vf', 'scale=900:-1', '-frames:v', '1', '-q:v', '2', str(small)],
                   capture_output=True, timeout=40, creationflags=subprocess.CREATE_NO_WINDOW)
    p = subprocess.run([str(exe), '-m', str(model), '--mmproj', str(proj), '--image', str(small), '-p', prompt,
                        '-n', '200', '--temp', '0', '--threads', '4', '--ctx-size', '4096', '--no-mmproj-offload',
                        '--device', 'none', '--verbosity', '1', '--offline'],
                       capture_output=True, text=True, encoding='utf8', errors='replace', timeout=180,
                       creationflags=subprocess.CREATE_NO_WINDOW)
    w, h = struct.unpack('>II', path.read_bytes()[16:24])
    print(json.dumps({'image': str(path), 'size': [w, h], 'png_bytes': path.stat().st_size,
                      'exit': p.returncode, 'description': p.stdout.strip()}, ensure_ascii=False))
