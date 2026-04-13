import jwt
from functools import wraps
from flask import request, g, jsonify
from models import users
from config import JWT_SECRET

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token') or (request.headers.get('Authorization', '').replace('Bearer ', '') or None)
        if not token:
            return jsonify({'success': False, 'msg': 'Unauthorized'}), 401
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'msg': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'msg': 'Invalid token'}), 401
        if payload.get('role') == 'admin':
            g.user = payload
            g.is_admin = True
        else:
            user = users.find_one({'accountName': payload.get('accountName')})
            if not user:
                return jsonify({'success': False, 'msg': 'User not found'}), 401
            g.user = user
            g.is_admin = False
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token') or (request.headers.get('Authorization', '').replace('Bearer ', '') or None)
        if not token:
            return jsonify({'success': False, 'msg': 'Unauthorized'}), 401
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        except:
            return jsonify({'success': False, 'msg': 'Invalid token'}), 401
        if payload.get('role') != 'admin':
            return jsonify({'success': False, 'msg': 'Admin only'}), 403
        g.user = payload
        g.is_admin = True
        return f(*args, **kwargs)
    return decorated
