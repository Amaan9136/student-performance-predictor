from models import users, students, predictions
from utils.helpers import now
import random

def seed():
    if not users.find_one({'accountName': 'admin'}):
        users.insert_one({'accountName': 'admin', 'password': 'admin123', 'role': 'admin', 'createdAt': now()})
        print('Admin seeded.')
    if not users.find_one({'accountName': 'faculty1'}):
        users.insert_one({'accountName': 'faculty1', 'password': 'faculty123', 'role': 'faculty', 'subject': 'Mathematics', 'createdAt': now()})
        print('Sample faculty seeded.')
    if students.count_documents({}) == 0:
        sample_students = [
            {'name': 'Arjun Sharma', 'rollNo': 'CS001', 'subject': 'Mathematics', 'attendance': 85, 'internalMarks': [78, 82, 76], 'avg_internal': 78.67, 'assignmentScore': 80, 'createdBy': 'faculty1', 'createdAt': now()},
            {'name': 'Priya Patel', 'rollNo': 'CS002', 'subject': 'Mathematics', 'attendance': 92, 'internalMarks': [88, 91, 85], 'avg_internal': 88.0, 'assignmentScore': 90, 'createdBy': 'faculty1', 'createdAt': now()},
            {'name': 'Rahul Verma', 'rollNo': 'CS003', 'subject': 'Mathematics', 'attendance': 45, 'internalMarks': [38, 42, 35], 'avg_internal': 38.33, 'assignmentScore': 40, 'createdBy': 'faculty1', 'createdAt': now()},
            {'name': 'Sneha Iyer', 'rollNo': 'CS004', 'subject': 'Mathematics', 'attendance': 70, 'internalMarks': [62, 68, 65], 'avg_internal': 65.0, 'assignmentScore': 72, 'createdBy': 'faculty1', 'createdAt': now()},
            {'name': 'Kiran Reddy', 'rollNo': 'CS005', 'subject': 'Mathematics', 'attendance': 55, 'internalMarks': [48, 52, 45], 'avg_internal': 48.33, 'assignmentScore': 50, 'createdBy': 'faculty1', 'createdAt': now()},
        ]
        students.insert_many(sample_students)
        print('Sample students seeded.')
    print('Seed complete.')

if __name__ == '__main__':
    seed()
