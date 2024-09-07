from flask import Flask, request, jsonify
import joblib 
import pandas as pd

model = joblib.load('model.pkl')
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    product = pd.DataFrame(data)

    predictions = model.predict(product)

    return jsonify({'predictions': predictions.tolist()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3003)
