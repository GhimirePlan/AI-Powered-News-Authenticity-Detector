import pickle
from Prediction import Prediction
from Prediction import FakeNewsLSTM
import pandas as pd
import torch
import pandas as pd
import os
with open(os.path.dirname(__file__) + '\\RF.pkl', 'rb') as f:
    RF = pickle.load(f)
with open(os.path.dirname(__file__) + '\\GB.pkl', 'rb') as f:
    GB = pickle.load(f)
with open(os.path.dirname(__file__) + '\\LR.pkl', 'rb') as f:
    LR = pickle.load(f)
with open(os.path.dirname(__file__) + '\\OC.pkl', 'rb') as f:
    OC = pickle.load(f)
with open(os.path.dirname(__file__) + '\\vect.pkl', 'rb') as f:
    vect = pickle.load(f)
with open(os.path.dirname(__file__) + '\\PT.pkl', 'rb') as f:
    pt = pickle.load(f)
with open(os.path.dirname(__file__) + '\\vocab.pkl', 'rb') as f:
    vocab = pickle.load(f)


df = pd.read_csv(os.path.dirname(__file__) + '\\test.csv')
print(df)
pp = Prediction(OC, LR, GB, RF,pt, vect, vocab)
df = pp.add(df,"रुवा बन्दुकसहित \n रुवा बन्दुकसहित ", 0)
print(pp.predict())
print(pp.get_percent())