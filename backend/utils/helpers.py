import jwt, random, string, datetime
from bson import ObjectId
from flask import jsonify
from config import JWT_SECRET, JWT_EXPIRY

def ok(data=None, **kwargs):
    return jsonify({'success': True, 'data': data, **kwargs}), 200

def err(msg, code=400):
    return jsonify({'success': False, 'msg': msg}), code

def now():
    return datetime.datetime.utcnow()

def serial(doc):
    if doc is None:
        return None
    result = {}
    for k, v in doc.items():
        if k == '_id':
            result['id'] = str(v)
        elif isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, datetime.datetime):
            result[k] = v.isoformat()
        elif isinstance(v, list):
            result[k] = [serial(i) if isinstance(i, dict) else (str(i) if isinstance(i, ObjectId) else i) for i in v]
        else:
            result[k] = v
    return result

def serial_list(docs):
    return [serial(d) for d in docs]

def make_token(**payload):
    payload['exp'] = datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXPIRY)
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256'), JWT_EXPIRY

def set_auth_cookie(resp, token):
    resp.set_cookie('token', token, httponly=True, samesite='Lax', secure=False, max_age=JWT_EXPIRY)

def clear_auth_cookie(resp):
    resp.set_cookie('token', '', expires=0)

def gen_code(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
