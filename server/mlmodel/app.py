from flask import Flask, request, jsonify
import joblib
import xgboost as xgb
import pandas as pd

app = Flask(__name__)

# Load the model from the file
model = joblib.load('xgboost_trust_score_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    # Get the input data from the request
    input_data = request.get_json()

    # Create a pandas DataFrame from the input data
    df = pd.DataFrame(input_data)

    # Make predictions using the model
    predictions = model.predict(df)

    # Return the predictions as JSON
    return jsonify(predictions.tolist())

if __name__ == '_main_':
    app.run(debug=True)