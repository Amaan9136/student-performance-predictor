from flask import Blueprint, request, g
from bson import ObjectId
from models import students, predictions
from utils.helpers import ok, err, now, serial, serial_list
from middleware.auth import auth_required
from ml import predictor
from ml.ollama_client import get_ai_advice

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api/predictions')

@prediction_bp.route('/predict', methods=['POST'])
@auth_required
def predict():
    d = request.json or {}
    sid = d.get('studentId')
    if not sid:
        return err('studentId is required')
    student = students.find_one({'_id': ObjectId(sid)})
    if not student:
        return err('Student not found', 404)
    result = predictor.predict(student['attendance'], student.get('avg_internal', 0), student['assignmentScore'])
    doc = {
        'studentId': ObjectId(sid),
        'studentName': student['name'],
        'rollNo': student['rollNo'],
        'subject': student['subject'],
        'attendance': student['attendance'],
        'avg_internal': student.get('avg_internal', 0),
        'assignmentScore': student['assignmentScore'],
        'score': result['score'],
        'grade': result['grade'],
        'risk': result['risk'],
        'createdBy': g.user.get('accountName'),
        'createdAt': now()
    }
    predictions.insert_one(doc)
    students.update_one({'_id': ObjectId(sid)}, {'$set': {'latestPrediction': result, 'predictedAt': now()}})
    return ok(serial(doc))

@prediction_bp.route('/history', methods=['GET'])
@auth_required
def history():
    filt = {} if g.is_admin else {'createdBy': g.user.get('accountName')}
    docs = list(predictions.find(filt).sort('createdAt', -1).limit(50))
    return ok(serial_list(docs))

@prediction_bp.route('/ai-advice', methods=['POST'])
@auth_required
def ai_advice():
    d = request.json or {}
    sid = d.get('studentId')
    if not sid:
        return err('studentId is required')
    student = students.find_one({'_id': ObjectId(sid)})
    if not student:
        return err('Student not found', 404)
    prediction = student.get('latestPrediction')
    if not prediction:
        return err('No prediction found for this student. Run prediction first.')
    student_data = {
        'name': student['name'],
        'attendance': student['attendance'],
        'avg_internal': student.get('avg_internal', 0),
        'assignment_score': student['assignmentScore']
    }
    advice = get_ai_advice(student_data, prediction)
    return ok({'advice': advice})

@prediction_bp.route('/report', methods=['GET'])
@auth_required
def report():
    filt = {} if g.is_admin else {'createdBy': g.user.get('accountName')}
    all_preds = list(predictions.find(filt))
    if not all_preds:
        return ok({'total': 0, 'avgScore': 0, 'avgAttendance': 0, 'gradeDistribution': {}, 'riskDistribution': {}})
    scores = [p['score'] for p in all_preds]
    attendances = [p['attendance'] for p in all_preds]
    grade_dist = {}
    risk_dist = {}
    for p in all_preds:
        grade_dist[p['grade']] = grade_dist.get(p['grade'], 0) + 1
        risk_dist[p['risk']] = risk_dist.get(p['risk'], 0) + 1
    return ok({
        'total': len(all_preds),
        'avgScore': round(sum(scores) / len(scores), 2),
        'avgAttendance': round(sum(attendances) / len(attendances), 2),
        'gradeDistribution': grade_dist,
        'riskDistribution': risk_dist
    })
