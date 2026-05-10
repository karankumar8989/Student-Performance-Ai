from sklearn.ensemble import RandomForestClassifier
import pickle
import numpy as np

# Sample training data
X = np.array([
    [2, 50, 40, 45],
    [5, 70, 65, 60],
    [8, 90, 85, 88],
    [1, 40, 35, 30],
    [6, 75, 70, 72]
])

# Labels
# 0 = Weak
# 1 = Average
# 2 = Strong
y = [0, 1, 2, 0, 2]

# Train model
model = RandomForestClassifier()

model.fit(X, y)

# Save model
pickle.dump(model, open("student_model.pkl", "wb"))

print("student_model.pkl created successfully")