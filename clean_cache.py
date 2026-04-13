import os
import shutil

dirs_to_clean = [
    'frontend/.next',
    'frontend/node_modules/.cache',
    'backend/__pycache__',
    'backend/models/__pycache__',
    'backend/utils/__pycache__',
    'backend/middleware/__pycache__',
    'backend/ml/__pycache__',
    'backend/routes/__pycache__',
]

files_to_clean = [
    'backend/ml/model.pkl',
]

for d in dirs_to_clean:
    if os.path.exists(d):
        shutil.rmtree(d)
        print(f'Removed: {d}')

for f in files_to_clean:
    if os.path.exists(f):
        os.remove(f)
        print(f'Removed: {f}')

print('Cache cleaned.')
