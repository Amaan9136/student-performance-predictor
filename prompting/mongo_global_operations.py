from pymongo import MongoClient
from collections import defaultdict
import os
MONGO_URI="mongodb://localhost:27017/student-performance";DB_NAME="student-performance";SAMPLE_SIZE=1000
client=MongoClient(MONGO_URI);db=client[DB_NAME]
SAVE_MONGO_SCHEMA="prompting/MONGO_SCHEMA.txt"
def get_type(v):
    if isinstance(v,bool): return "bool"
    if isinstance(v,int): return "int"
    if isinstance(v,float): return "float"
    if isinstance(v,list): return f"array<{get_type(v[0])}>" if v else "array"
    if isinstance(v,dict): return "object"
    if v is None: return "null"
    return type(v).__name__
def analyze(c):
    docs=list(db[c].find().limit(SAMPLE_SIZE))
    if not docs: print(f"[LOG] {c}: no documents found"); return [],[],{},True
    kc=defaultdict(int);types=defaultdict(set);td=len(docs)
    for d in docs:
        if not isinstance(d,dict): print(f"[LOG] {c}: invalid document skipped -> {d}"); continue
        for k,v in d.items(): kc[k]+=1; types[k].add(get_type(v))
    common=[k for k,v in kc.items() if v==td];additional=[k for k,v in kc.items() if v<td]
    print(f"{c}: analyzed {td} docs | common={len(common)} additional={len(additional)}")
    return common,additional,{k:"|".join(sorted(v)) for k,v in types.items()},False
def print_schema():
    lines=["===== MongoDB Schema Overview =====\n",f"Database: {DB_NAME}\n"]
    cols=db.list_collection_names()
    if not cols:
        print("[LOG] No collections found in database.")
        return
    for c in cols:
        common,opt,types,empty=analyze(c)
        lines.append(f"{c}:")
        if empty:
            lines.append("required:[None]")
            lines.append("optional:[None]\n")
            continue
        req=",".join([f"{k}:{types.get(k,'unknown')}" for k in common]) if common else "[None]"
        op=",".join([f"{k}:{types.get(k,'unknown')}" for k in opt]) if opt else "[None]"
        lines.append(f"required:{req}")
        lines.append(f"optional:{op}\n")
    out="\n".join(lines)
    print(f"\n{out}")
    os.makedirs(os.path.dirname(SAVE_MONGO_SCHEMA),exist_ok=True)
    with open(SAVE_MONGO_SCHEMA,"w",encoding="utf-8") as f: f.write(out)
    print(f"[LOG] Schema saved -> {SAVE_MONGO_SCHEMA}")
def rename_key(old,new):
    total=0; cols=db.list_collection_names()
    if not cols: print("[LOG] No collections found."); return
    print(f"[LOG] Starting rename '{old}' -> '{new}'")
    for c in cols:
        try:
            count=db[c].count_documents({old:{"$exists":True}})
            if not count: print(f"[LOG] {c}: key '{old}' not found"); continue
            r=db[c].update_many({old:{"$exists":True}},{"$rename":{old:new}})
            print(f"[LOG] {c}: matched={r.matched_count} modified={r.modified_count}")
            if r.modified_count: print(f"{c}: {r.modified_count} updated"); total+=r.modified_count
        except Exception as e: print(f"[ERROR] {c}: {e}")
    print(f"\nTotal documents updated: {total}\n")
def search_key_global(key):
    cols=db.list_collection_names()
    if not cols: print("[LOG] No collections found."); return
    print(f"\n[LOG] Searching for key '{key}' across database '{DB_NAME}'...\n"); found=False
    for c in cols:
        try:
            count=db[c].count_documents({key:{"$exists":True}})
            if count>0: print(f"{DB_NAME} > {c}  --> {count} document(s) contain '{key}'"); found=True
            else: print(f"[LOG] {c}: key not found")
        except Exception as e: print(f"[ERROR] {c}: {e}")
    if not found: print(f"\n[LOG] Key '{key}' not found in any collection.\n")
def menu():
    while True:
        print("1. Print Database Schema"); print("2. Rename Key Globally"); print("3. Search Key Globally"); print("4. Exit")
        ch=input("\nSelect option: ").strip()
        if ch=="1": print_schema()
        elif ch=="2":
            old=input("Enter key to find: ").strip(); new=input("Enter new key name: ").strip()
            if not old or not new: print("[LOG] Invalid key input"); continue
            rename_key(old,new)
        elif ch=="3":
            key=input("Enter key name to search: ").strip()
            if not key: print("[LOG] Invalid key"); continue
            search_key_global(key)
        elif ch=="4": print("[LOG] Exiting..."); break
        else: print("[LOG] Invalid option")
if __name__=="__main__": menu()