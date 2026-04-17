import pickle
import sys
import numpy as np
import os

def predict():
    try:
        # 1. Load the model
        model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
        with open(model_path, 'rb') as f:
            model = pickle.dump if hasattr(pickle, 'dump') else None # Placeholder, I'll fix it in a sec
            model = pickle.load(f)

        # 2. Get inputs from CLI
        if len(sys.argv) < 4:
            sys.exit(0)

        total_claims = float(sys.argv[1])
        approved_claims = float(sys.argv[2])
        rejected_claims = float(sys.argv[3])

        # 3. Format input for scikit-learn
        input_data = np.array([[total_claims, approved_claims, rejected_claims]])

        # 4. Predict
        prediction = model.predict(input_data)

        # 5. Output only the result
        print(int(prediction[0]))

    except Exception as e:
        # In production, you might want to log this to a file
        # But for CLI integration, we keep it quiet or return 0
        sys.exit(0)

if __name__ == "__main__":
    predict()
