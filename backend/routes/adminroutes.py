from flask import Blueprint, request
from bson import ObjectId
from models import students, users, predictions, db
from utils.helpers import ok, err, serial_list
from middleware.auth import admin_required
from ml import predictor

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard():
    total_students = students.count_documents({})
    total_users = users.count_documents({'role': {'$ne': 'admin'}})
    total_predictions = predictions.count_documents({})
    all_preds = list(predictions.find({}, {'score': 1, 'grade': 1}))
    avg_score = round(sum(p['score'] for p in all_preds) / len(all_preds), 2) if all_preds else 0
    grade_dist = {}
    for p in all_preds:
        grade_dist[p['grade']] = grade_dist.get(p['grade'], 0) + 1
    recent = list(predictions.find({}).sort('createdAt', -1).limit(5))
    return ok({
        'totalStudents': total_students,
        'totalUsers': total_users,
        'totalPredictions': total_predictions,
        'avgPredictedScore': avg_score,
        'gradeDistribution': grade_dist,
        'recentPredictions': serial_list(recent)
    })

@admin_bp.route('/students', methods=['GET'])
@admin_required
def all_students():
    q = request.args.get('q', '').strip()
    filt = {}
    if q:
        filt['$or'] = [{'name': {'$regex': q, '$options': 'i'}}, {'rollNo': {'$regex': q, '$options': 'i'}}, {'subject': {'$regex': q, '$options': 'i'}}]
    docs = list(students.find(filt).sort('createdAt', -1))
    return ok(serial_list(docs))

@admin_bp.route('/students/<id>', methods=['DELETE'])
@admin_required
def delete_student(id):
    students.delete_one({'_id': ObjectId(id)})
    predictions.delete_many({'studentId': ObjectId(id)})
    return ok(True)

@admin_bp.route('/users', methods=['GET'])
@admin_required
def all_users():
    q = request.args.get('q', '').strip()
    filt = {'role': {'$ne': 'admin'}}
    if q:
        filt['accountName'] = {'$regex': q, '$options': 'i'}
    docs = list(users.find(filt).sort('createdAt', -1))
    for d in docs:
        d.pop('password', None)
    return ok(serial_list(docs))

@admin_bp.route('/train', methods=['POST'])
@admin_required
def train_model():
    all_preds = list(predictions.find({}, {'attendance': 1, 'avg_internal': 1, 'assignmentScore': 1, 'score': 1}))
    samples = [{'attendance': p['attendance'], 'avg_internal': p.get('avg_internal', 0), 'assignment_score': p.get('assignmentScore', 0), 'final_score': p['score']} for p in all_preds]
    predictor.train(samples)
    return ok({'trained': True, 'samples': len(samples)})

@admin_bp.route('/viz-data', methods=['GET'])
@admin_required
def viz_data():
    data = predictor.get_viz_data()
    all_preds = list(predictions.find({}, {'attendance': 1, 'avg_internal': 1, 'assignmentScore': 1, 'score': 1, 'grade': 1, 'risk': 1, 'studentName': 1}))
    prediction_points = [{'attendance': p['attendance'], 'avg_internal': p.get('avg_internal', 0), 'assignment_score': p.get('assignmentScore', 0), 'score': p['score'], 'grade': p['grade'], 'risk': p['risk'], 'name': p.get('studentName', '')} for p in all_preds]
    return ok({**data, 'predictions': prediction_points})