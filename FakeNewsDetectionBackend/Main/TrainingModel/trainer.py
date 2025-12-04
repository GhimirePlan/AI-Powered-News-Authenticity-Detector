import pickle
from .Prediction import Prediction
from .Prediction import FakeNewsLSTM
import pandas as pd
import torch,os
import pandas as pd
from Main.models import News
class TrainModel:
    def __init__(self) -> None:
        pass
    def trainModel(self):
        df=pd.DataFrame()
        numfake=News.objects.filter(isfake=True).count()
        numreal=numfake 
        count=0
        for data in News.objects.filter(isfake=False):
            temp = pd.DataFrame([[data.description,1]], columns=["text", "class"])
            df=pd.concat([df,temp])
            count+=1
            if numreal<=count:
                break
        count=0
        for data in News.objects.filter(isfake=True):
            temp = pd.DataFrame([[data.description,0]], columns=["text", "class"])
            df=pd.concat([df,temp])
            count+=1
            if numfake<=count:
                break
        for data in News.objects.all():
            print(data.description)
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

        pp = Prediction(OC, LR, GB, RF,pt, vect, vocab)
        pp.fit(df)
