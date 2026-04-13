from flask import Blueprint, request, make_response, g
from models import users
from utils.helpers import ok, err, now, serial, make_token, set_auth_cookie, clear_auth_cookie
from middleware.auth import auth_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    d = request.json or {}
    name = (d.get('accountName') or '').strip()
    pwd = d.get('password', '')
    confirm = d.get('confirmPassword', '')
    subject = (d.get('subject') or '').strip()
    if not name or not pwd or not subject:
        return err('accountName, password, and subject are required')
    if pwd != confirm:
        return err('Passwords do not match')
    if len(pwd) < 6:
        return err('Password must be at least 6 characters')
    if users.find_one({'accountName': name}):
        return err('Account name already taken')
    doc = {'accountName': name, 'password': pwd, 'subject': subject, 'role': 'faculty', 'createdAt': now()}
    users.insert_one(doc)
    token, expiry = make_token(accountName=name, role='faculty')
    resp = make_response(ok(serial(doc)))
    set_auth_cookie(resp, token)
    return resp

@auth_bp.route('/login', methods=['POST'])
def login():
    d = request.json or {}
    name = (d.get('accountName') or '').strip()
    pwd = d.get('password', '')
    user = users.find_one({'accountName': name, 'role': {'$ne': 'admin'}})
    if not user or user.get('password') != pwd:
        return err('Invalid credentials', 401)
    token, expiry = make_token(accountName=name, role='faculty')
    resp = make_response(ok({'user': serial(user), 'token': token}))
    set_auth_cookie(resp, token)
    return resp

@auth_bp.route('/admin-login', methods=['POST'])
def admin_login():
    d = request.json or {}
    name = (d.get('accountName') or '').strip()
    pwd = d.get('password', '')
    user = users.find_one({'accountName': name, 'role': 'admin'})
    if not user or user.get('password') != pwd:
        return err('Invalid admin credentials', 401)
    token, expiry = make_token(accountName=name, role='admin', username=name)
    resp = make_response(ok({'admin': {'accountName': name, 'role': 'admin', 'username': name}, 'token': token}))
    set_auth_cookie(resp, token)
    return resp

@auth_bp.route('/me', methods=['GET'])
@auth_required
def me():
    if g.is_admin:
        return ok(g.user)
    return ok(serial(g.user))

@auth_bp.route('/logout', methods=['POST'])
def logout():
    resp = make_response(ok(True))
    clear_auth_cookie(resp)
    return resp
