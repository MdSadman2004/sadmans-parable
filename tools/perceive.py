import json,pathlib,subprocess,shutil,struct
root=pathlib.Path(__file__).resolve().parent.parent
exe=root/'qa/vision-tools/llama-mtmd-cli.exe'
model=pathlib.Path('D:/Apps/models/vlm/SmolVLM2-2.2B-Instruct-Q4_K_M.gguf')
projector=pathlib.Path('D:/Apps/models/vlm/mmproj-SmolVLM2-2.2B-Instruct-Q8_0.gguf')
results=[]
for name in ['title','records-first','mirror-first','flood-first','rooftop-first','workshop-first','stairwell-first']:
    path=root/'qa'/f'{name}.png'
    small=root/'qa'/f'{name}-vision.jpg'
    convert=subprocess.run([shutil.which('ffmpeg'),'-y','-i',str(path),'-vf','scale=768:-1','-frames:v','1','-q:v','2',str(small)],capture_output=True,timeout=30,creationflags=subprocess.CREATE_NO_WINDOW)
    if convert.returncode: raise RuntimeError(convert.stderr.decode(errors='replace'))
    numeric={'size':struct.unpack('>II',path.read_bytes()[16:24]),'png_bytes':path.stat().st_size}
    args=[str(exe),'-m',str(model),'--mmproj',str(projector),'--image',str(small),'-p','Describe the visible setting, objects, colors, lighting and text placement. Is the image clearly rendered or mostly blank? Do not invent invisible gameplay.','-n','180','--temp','0','--threads','4','--ctx-size','4096','--no-mmproj-offload','--device','none','--verbosity','1','--offline']
    proc=subprocess.run(args,capture_output=True,text=True,encoding='utf8',errors='replace',timeout=150,creationflags=subprocess.CREATE_NO_WINDOW)
    item={'image':str(path),'exit_code':proc.returncode,'description':proc.stdout.strip(),'stderr':proc.stderr[-1500:],'numeric':numeric,'backend':'local SmolVLM2-2.2B, CPU, no image upload'}
    results.append(item);print(json.dumps(item,ensure_ascii=False))
root.joinpath('qa/visual-readback.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
