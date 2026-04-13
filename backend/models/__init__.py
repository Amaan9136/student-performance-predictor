from pymongo import MongoClient
from config import MONGO_URI
client = MongoClient(MONGO_URI)
db = client['student-performance']
users = db['users']
students = db['students']
predictions = db['predictions']
