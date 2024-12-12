import pandas as pd
from flask import Flask
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

# Load the updated dataset
file_path = 'desktop_dataset.csv'
data = pd.read_csv(file_path)

# Drop irrelevant columns (assuming columns are no longer relevant)
irrelevant_columns = ['userAgent', 'ip_address']
data = data.drop(columns=irrelevant_columns)

# Handle missing values
data = data.dropna()  # Drop rows with missing values

# Encode categorical variables
data['label'] = data['label'].map({'bot': 0, 'human': 1})  # Encode target as 0 (bot) and 1 (human)

# Feature weights for trust score calculation (Adjusted)
feature_weights = {
    'mouseSpeed': 10,
    'linearMovement': 7,  # Reduced weight to balance importance
    'clickRate': 12,  # Adjusted to be less dominant
    'typeRate': 15,  # Slightly increased
    'averageResponseTime': -3,  # Re-evaluated based on data range
    'mouseMovementsCount': 10,  # Balanced weight
    'clicksCount': 13,  # Slightly reduced
}

# Calculate trust score
data['trust_score'] = sum(data[feature] * weight for feature, weight in feature_weights.items())
data['trust_score'] = data['trust_score'].clip(lower=0, upper=100)

# Separate features and target (trust score)
X = data.drop(columns=['trust_score', 'label'])  # Features
y = data['trust_score']  # Target (trust score)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train XGBoost model
model = xgb.XGBRegressor(
    objective='reg:squarederror',
    n_estimators=200,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)
model.fit(X_train, y_train)

# Predict trust scores
y_pred = model.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Squared Error: {mse:.2f}")
print(f"R2 Score: {r2:.2f}")

# Save predictions with test data
results = pd.DataFrame({
    'Actual Trust Score': y_test,
    'Predicted Trust Score': y_pred
})
results.to_csv('predicted_trust_scores.csv', index=False)
print("Predicted trust scores saved to 'predicted_trust_scores.csv'.")

import joblib

# Save the model to a file
model_file_path = 'xgboost_trust_score_model.pkl'
joblib.dump(model, model_file_path)