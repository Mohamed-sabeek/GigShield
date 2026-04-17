import pandas as pd
import pickle
from sklearn.linear_model import LogisticRegression

def train_and_save_model():
    try:
        # 1. Load the dataset
        data = pd.read_csv('data.csv')
        
        # 2. Extract features and target
        X = data[['totalClaims', 'approvedClaims', 'rejectedClaims']]
        y = data['fraud']
        
        # 3. Initialize and train the internal model
        model = LogisticRegression()
        model.fit(X, y)
        
        # 4. Save the trained model to a pickle file
        with open('model.pkl', 'wb') as f:
            pickle.dump(model, f)
            
        print("Model trained and saved")
        
    except Exception as e:
        print(f"Error during training: {e}")

if __name__ == "__main__":
    train_and_save_model()
