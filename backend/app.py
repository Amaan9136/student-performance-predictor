import os
from dotenv import load_dotenv
load_dotenv()
IS_PROD = os.getenv('PROJECT_MODE', 'development').strip().lower() == 'production'
if IS_PROD:
    from gevent import monkey
    monkey.patch_all()
from flask import Flask
from flask_cors import CORS
from routes.authroutes import auth_bp
from routes.studentroutes import student_bp
from routes.predictionroutes import prediction_bp
from routes.adminroutes import admin_bp
from utils.helpers import ok

app = Flask(__name__)
origins = ['http://localhost:3000', 'http://127.0.0.1:3000'] if not IS_PROD else os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r'/api/*': {'origins': origins, 'supports_credentials': True, 'allow_headers': ['Content-Type', 'Authorization'], 'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']}})
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'supersecret_change_in_prod')
app.config['PROPAGATE_EXCEPTIONS'] = True

for bp in [auth_bp, student_bp, prediction_bp, admin_bp]:
    app.register_blueprint(bp)

@app.route('/api/health')
def health():
    return ok(True, msg='Student Performance API running', mode=os.getenv('PROJECT_MODE', 'development'))

if __name__ == '__main__':
    if IS_PROD:
        from gevent.pywsgi import WSGIServer
        WSGIServer(('0.0.0.0', int(os.getenv('PORT', 5000))), app).serve_forever()
    else:
        app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)), threaded=True, use_reloader=False)
