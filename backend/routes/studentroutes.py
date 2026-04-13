from flask import Blueprint, request, g
from bson import ObjectId
from models import students
from utils.helpers import ok, err, now, serial, serial_list
from middleware.auth import auth_required

student_bp = Blueprint('student', __name__, url_prefix='/api/students')

def _avg(marks):
    return round(sum(marks) / len(marks), 2) if marks else 0

@student_bp.route('', methods=['GET'])
@auth_required
def list_students():
    q = request.args.get('q', '').strip()
    filt = {'createdBy': g.user.get('accountName') if not g.is_admin else {'$exists': True}}
    if g.is_admin:
        filt = {}
    if q:
        filt['$or'] = [{'name': {'$regex': q, '$options': 'i'}}, {'rollNo': {'$regex': q, '$options': 'i'}}]
    docs = list(students.find(filt).sort('createdAt', -1))
    return ok(serial_list(docs))

@student_bp.route('', methods=['POST'])
@auth_required
def add_student():
    d = request.json or {}
    name = (d.get('name') or '').strip()
    roll = (d.get('rollNo') or '').strip()
    subject = (d.get('subject') or '').strip()
    attendance = d.get('attendance')
    internal = d.get('internalMarks', [])
    assignment = d.get('assignmentScore')
    if not name or not roll or not subject:
        return err('name, rollNo, and subject are required')
    if attendance is None or assignment is None:
        return err('attendance and assignmentScore are required')
    if not isinstance(internal, list) or len(internal) != 3:
        return err('internalMarks must be an array of 3 values')
    doc = {
        'name': name, 'rollNo': roll, 'subject': subject,
        'attendance': float(attendance),
        'internalMarks': [float(x) for x in internal],
        'avg_internal': _avg([float(x) for x in internal]),
        'assignmentScore': float(assignment),
        'createdBy': g.user.get('accountName'),
        'createdAt': now()
    }
    students.insert_one(doc)
    return ok(serial(doc))

@student_bp.route('/<id>', methods=['GET'])
@auth_required
def get_student(id):
    doc = students.find_one({'_id': ObjectId(id)})
    if not doc:
        return err('Student not found', 404)
    return ok(serial(doc))

@student_bp.route('/<id>', methods=['PUT'])
@auth_required
def update_student(id):
    d = request.json or {}
    update = {}
    if 'name' in d: update['name'] = d['name'].strip()
    if 'rollNo' in d: update['rollNo'] = d['rollNo'].strip()
    if 'subject' in d: update['subject'] = d['subject'].strip()
    if 'attendance' in d: update['attendance'] = float(d['attendance'])
    if 'internalMarks' in d:
        marks = [float(x) for x in d['internalMarks']]
        update['internalMarks'] = marks
        update['avg_internal'] = _avg(marks)
    if 'assignmentScore' in d: update['assignmentScore'] = float(d['assignmentScore'])
    update['updatedAt'] = now()
    students.update_one({'_id': ObjectId(id)}, {'$set': update})
    doc = students.find_one({'_id': ObjectId(id)})
    return ok(serial(doc))

@student_bp.route('/<id>', methods=['DELETE'])
@auth_required
def delete_student(id):
    students.delete_one({'_id': ObjectId(id)})
    return ok(True)
