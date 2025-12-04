import re
import scipy
import pandas as pd
import torch
import re
from nltk.tokenize import RegexpTokenizer
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
from torch.utils.data import DataLoader, TensorDataset
import torch.nn as nn
import torch.optim as optim
import os

class FakeNewsLSTM(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim, n_layers, bidirectional, dropout):
        super(FakeNewsLSTM, self).__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, 
                            hidden_dim, 
                            num_layers=n_layers, 
                            bidirectional=bidirectional, 
                            dropout=dropout, 
                            batch_first=True)
        
        self.fc = nn.Linear(hidden_dim * 2 if bidirectional else hidden_dim, output_dim)
        self.dropout = nn.Dropout(dropout)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        embedded = self.dropout(self.embedding(x))
        lstm_out, (hidden, cell) = self.lstm(embedded)
        hidden = self.dropout(torch.cat((hidden[-2,:,:], hidden[-1,:,:]), dim=1)) if self.lstm.bidirectional else hidden[-1,:,:]
        output = self.fc(hidden)
        return self.sigmoid(output)
    
class Prediction:
    def __init__(self,OC, LR, GB, RF, pt,vect,vocab):
        self.OC = OC
        self.LR = LR
        self.GB = GB
        self.RF = RF
        self.pt = pt
        self.vect = vect

        self.vocab = vocab
        self.suf = []
        self.words = [ ]
        
        with open(os.path.dirname(__file__) + '\\suf.txt', "r", encoding="utf-8-sig") as s:
            for t in s.read().split("\n"):
                self.suf.append(t)
        
        
        with open(os.path.dirname(__file__) + '\\dict.txt', "r", encoding="utf-8-sig") as s:
            for t in s.read().split("\n"):
                self.words.append(t)

    def clean_text_(self,text):
        text = re.sub(r'[^\u0900-\u097F\s]', '', text)  
        text = re.sub(r'\s+', ' ', text).strip() 
        puncts = r"$&+,:;=?@#|'<>.^*()%!-।"
        if text in list(puncts):
            return text
        else:
            text = re.sub(r"[$&+।।,:;=?@#|'<>.^*()%!-]","", text)

        return text
    tokenizer = RegexpTokenizer(r'[\u0900-\u097F]+') 

    def build_vocab(self,tokenized_texts, max_vocab_size=10000):
        all_tokens = [token for tokens in tokenized_texts for token in tokens]
        word_counts = Counter(all_tokens)
        vocab = {word: idx + 2 for idx, (word, _) in enumerate(word_counts.most_common(max_vocab_size))}
        vocab["<PAD>"] = 0  
        vocab["<UNK>"] = 1  
        return vocab

    def text_to_sequence(self,tokens, vocab):
        return [vocab.get(token, vocab["<UNK>"]) for token in tokens]

    def preprocess_data(self,df, vocab):
        tokenized_texts = []
        for text in df['text']:
            cleaned_text = self.clean_text_(text)
            tokens = self.tokenizer.tokenize(cleaned_text)
            tokenized_texts.append(tokens)
        
        sequences = [self.text_to_sequence(tokens, vocab) for tokens in tokenized_texts]
        
        return sequences


    def removeCharacters(self,s):
        tmp = s
            
        tmp = re.sub(r"[\x00\x01\x10\x15\x16\x1a\x1e\x02\x03\x05\x06\x07\x08\x17\x1f\x7f\x81\x82\x83\x84\x85\x86\x88\x8d\x8f\x92\x93\x94\x95\x96\x9d\x9e\xa0\xad\uf047\uf0a8\u09b1\uf0af\uf106\u2003\u206e\u206f\u2002\u2009\u200a\u200b\u200c\u200d\u200e\u200f\u2028\u2029\u202a\u202c\u202d\u202f\u2060\u3000\ue86c\uf000\uf001\uf002\uf020\uf026\uf02a\uf02d\uf02f\uf034\uf038\uf03a\uf03c\uf03d\uf03f\uf040\uf046\uf061\uf065\uf06c\uf06d\uf06e\uf071\uf072\uf074\uf075\uf076\uf077\uf07d\uf085\uf096\uf0a2\uf0a7\uf0ab\uf0b6\uf0b7\uf0d8\uf0da\uf0dc\uf0e0\uf0fc\uf164\uf16a\uf339\uf3c6\uf449\uf44c\uf468\uf495\uf4fd\uf527\uf602\uf60a\uf62d\uf64f\uf8ea\uf8ff\ufeff\u0604\U00100000\U00100001\U001000a5\U001000f2\U0010012e\U001001d1\U001001d3\U00100223\U0010024d\u2063\u09b1]+","", ##removing unparsed unicode char sequence
                    re.sub(r"[a-zA-Zａ-ｚＡ-Ｚ\u00C0-\u024F\u1E00-\u1EFF]+","", # Supposed to be Accented Alphabets
                    re.sub(r'[一-龠ぁ-ゔァ-ヴー々〆〤ヶアガシズタニネメルー下中亚亞人來公共区區古司吐吴和哔哩国國圳塞多客宮家山岡战戰文日春有木本朴村来民沙深相秋站粵織華蕃藏西言話語语贛載遥限音飯馬马鮨가공구국다대러민바박상서선스어울유의인재조주축팀표플한화ㄩㅎ㎡꞊ꣳ각간감강같개거건걸것게겠겨견경계고과관광교궁권귀그극근글금급기김까껴꼭나난남납내너넉넓네넥녀년노느는늘능니닝단담답당더도동되된됩두드들등디때떨띠라람랍래랩런럼럽레력로록론료를름릎리릭립마만말맛맞매맺멋메멘며면명모목무문물미및발방배번법베변별보복볼봉부분브비뿐사살생샵섯성세셔소송수쉬습시식신실십싸써아안않앙액양언업없었에여역연열영오와외요용우운워원월웠위육으은을음이일임입있자작잘잠장저적전점정제져존종좋준줍줏중즈즣지직진집징짠짱째차착찬참찾책천첫청체초최추출치카컬켓코크큰클키킹타탁터템토톤통트특튼티판팬페편평포프피필핏하학할함합항해햇행향허현혜호홈확환활황회후휴️ﹾ！，：？｜～ｪｫﾥﾧﾪ]+', "", ## Supposed to be Korean
                    re.sub(r'[~¡£¤¥¦§¨©ª«¬®¯±²µ¶¹º»¼½¾৷੯ੰ–—―†‡•…‰‹›⁄₪€₱₹℅™⅓←→∈∉∑−∕∙√∛≈≠≡≤⋅┐├┬╕╖╗╛╡╢╣╦▇░▓■▪●⧼⧽（）‣￼�☺☼✊✋✌✍✏✓✔✴❆❤♫🇳🇵🌴🌷🌹🌺🌻🌽🌾🌿🎁🎤🎹🎼🏡🏼🏿🐍🐒👁👈👉👍👤👧👨👱💀💃💌💐💓💔💕💘💥💦💿📻🔥🔱🕸🖕😀😂😃😅😆😈😉😊😍😒😔😘😛😝😠😡😢😥😦😭🙁🙂🙈🙉🙊🙋🙏🚩🚫🤔🤣󠆶]+',"",  ## Symbols
                           tmp))))
                            
        tmp = re.sub(r'[¿ÀÁÅÇÈÍÏÓÖ×ØÙÛÜÝÞàáâãäåæçèéêëìíîïðñòóôõö÷øùúüýĀāăćČčĐđĕėğĩīıłňŋŌōŏŒœřŚśŠšũūůųŸŹŽƒǎǧɑɒɔəɛɡɪɾʃʉʊʌʒʔḗṳạảẹẻẽếễệỉịọỏồụủἀἐἱἷᾶῥⲁⲏⲓⲕⲣ]+',"",
                    re.sub(r'[ʾˆˈˌːˑΐΕΣάέίαβγδεζηθικλμνξοπρςσυφωόύϩЄІАБВГЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшъыьэюяёїҚқҡҧүҷӣԫՀաեյնր]+',"",
                           re.sub(r'[ִאבדוילןעפקרשת،ؒ؛؟ءآإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىئًَُِّْ٪٫٬ٰٹپچڈډڑژښکڬگڵںھہۆیێېےۓﮐﺗﺠﻪﻫﻮ۔ۛ۰۱۲۳۴۵۶۷۸۹ܐܒܗܝܡܢܪܬހބވދސަިެް]+',"",
                           tmp)))
        
        tmp = re.sub(r'[অআইউঋএঐওকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ়ািীুূেৈো্ৰৱ৳ਅਆਇਈਉਊਏਐਓਔਕਖਗਘਙਚਛਜਝਞਟਠਡਢਣਤਥਦਧਨਪਫਬਭਮਯਰਲਵਸਹ਼ਾਿੀੁੂੇੈੋੌ੍ੜ੦੧੨੩੪੫੬੭੮કગજઞતદનફમરષસાિીુેો્ଆଓଡ଼ିஅஇகஙசஜடதநனபமயரறலளழவஸாிீுூேைொ்అగతథనపమరలశహాిుూెొ్ಕಡನ್ംഅജഞപബമയരലളാിുോ്ංකනලසහිกขคงชญตทธนบปฟมยรลวศษสหอะัาำิีุเใไ่้์ຊດຕທນປລວສະັາິົໄ་།ཀཁགངཅཆཇཉཊཋཌཎཏཐདནཔཕབམཙཚཛཝཞཟའཡརལཤཥསཧཨིེོུྐྒྣྩྫྱྲྵྷစညတနပမရာုေံ္်ြაგთილმრუქማርኛአខភមរសាែ្ᤀᵻऽઅઇએઓચછઝપબયલવશહૌெంణಗಣಬರಳವಶೆೊഇഎഏഐഒകഖഗഘങചടഡണതഥദധനഫഭറഴവശഷസഹീൂെേൈൊൻർൽൾจฉซฒณดถผพภึืูแโๆ็๊๛ພ༺༻ྟྤྴဗბდევზკნოპსტფღყშჩცძწჭხჯჰᎦᎩᎯᎳᏂᏍᏣᏬᖳកគងចជញដណតថទធនបផពយលវហឡអឬឯឲិីឹុូួើៀេៃោៅំះៈ៉៊់៌៏័។៕១៥៨]+',"",
                           tmp)
        
        tmp = re.sub(r"[°³´·¸ɐɕɖɣɦɨɫɯɳɴʁʈʋʏʑʰʲʽˊˋ˗˘˚˜˝̵̷̡̧̞̩̪̭̯͈͙́̃̊̎̒̓ͧͬ̚͡ΑΒΔΖΗΘΙΚΛΜΝΟΠΡΤΥΦΧΩήτώДщєіјҫҳҶөӯԨստְֲֵַָֹֽ׀ׁׂהזחטךכםמנסץצؘؔأؤـٻڌڪ۩۾߮߰ऄ※₋℃№↑↩⇄⇒⇨∇∏∘∞⊕⊗⋲⎼④⑸─│┌╘►▼◄◊◌◎★☆☎☑☺☻♂♠♢♣♥♦♪⚠⛭✉❶❷❸❹❺➧⟲⟳⦁⭕、。《》「」『』【】🆚🇧🇬]+","",tmp)
        
        tmp = re.sub(r"[ \t]+"," ",tmp).strip()
        """
        query = tmp
        querywords = query.split()
    
        resultwords  = [word for word in querywords if word.lower() not in stopwords]
        tmp = ' '.join(resultwords)
        """
        s = tmp
            
        return s

    def clean_text(self, text, chars=None):
        puncts = r"$&+,:;=?@#|'<>.^*()%!-"
    
        if text in list(puncts):
            
            return text
        w = []
        w.append(text)
        w.append([])
        w[1] = re.findall(r"[$&+,:;=?@#|'<>.^*()%!-]", text)
        if len(w[1]) > 0:
            for p in w[1]:
                if w[0].endswith(p):
                    w[0] = w[0].removesuffix(p)
                
            
        
        return w
    def pad_sequences(self,sequences, max_length):
        padded = []
        for seq in sequences:
            if len(seq) > max_length:
                padded.append(seq[:max_length])
            else:
                padded.append(seq + [0] * (max_length - len(seq)))  
        return padded   

    def stem(self,text):
        if text in self.suf:
            return text

        w = []
        for t in text.split(" "):
            if t not in self.words:
                pattern = r'(\s*)(' + '|'.join(map(re.escape, self.suf)) + r')$'
                modified_text = re.sub(pattern, r' \2', t)
                if len(modified_text.split(" "))>1:
                    modified_text = self.stem(modified_text.split(" ")[0]) + " " + modified_text.split(" ")[1]
                w.append(modified_text)
            else:
                w.append(t)
            
        modified_text = " ".join(w)
        
        return modified_text
    def get_percent(self):
        t = self.p[0] + self.ms[0] + self.ns[0] + self.o[0] + self.op[0]
        t = t[0]
        print(f'{t/5*100:.4f}%')

    def add(self, df, text, cls):
        text = self.clean_text_(text)
        text = self.stem(text)
        temp = pd.DataFrame([[text,cls]], columns=["text", "class"])
        df = pd.concat([df,temp])
        if df["class"].value_counts()[0]>df["class"].value_counts()[1]:
            temp = df[df["class"]==1].sample(frac=1/len(df[df["class"]==1]))
            df = pd.concat([df,temp])
        elif df["class"].value_counts()[0]<df["class"].value_counts()[1]:
            temp = df[df["class"]==0].sample(frac=1/len(df[df["class"]==0]))
            df = pd.concat([df,temp])
        df = df.reset_index()
        df = df.drop(["index"], axis=1)
        
        return df

    def fit(self, dframe):
        labels = dframe['class']
        text = dframe['text']
        dframe['text'] = dframe['text'].fillna("")
        text = text.fillna("")
        self.vect.fit(text)
        v = self.vect.transform(text)
        self.OC.fit(v, labels)
        print(f'{self.OC} trained.')
        self.m.fit(v, labels)
        print(f'{self.m} trained.')
        self.LR.fit(v, labels)
        print(f'{self.LR} trained.')
        self.GB.fit(v, labels)
        print(f'{self.GB} trained.')
        tokenized_texts = [self.tokenizer.tokenize(self.clean_text_(text)) for text in dframe['text']]
        self.vocab = self.build_vocab(tokenized_texts)

        sequences = self.preprocess_data(dframe, self.vocab)
        dframe['sequences'] = sequences

        max_length = 100
        padded_sequences = self.pad_sequences(sequences, max_length)

        dframe['padded_sequences'] = padded_sequences
        sequences_tensor = torch.tensor(padded_sequences)
        labels_tensor = torch.tensor(dframe['class'].values)

        dataset = TensorDataset(sequences_tensor, labels_tensor)
        dataloader = DataLoader(dataset, batch_size=2, shuffle=True)

        for batch in dataloader:
            inputs, labels = batch
            print(inputs, labels)

        embedding_dim = 100
        hidden_dim = 256
        output_dim = 1
        n_layers = 2
        bidirectional = True
        dropout = 0.5
        model = FakeNewsLSTM(len(self.vocab), embedding_dim, hidden_dim, output_dim, n_layers, bidirectional, dropout)

        criterion = nn.BCELoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001)

        num_epochs = 2
        for epoch in range(num_epochs):
            model.train()
            epoch_loss = 0
            for batch in dataloader:
                text, labels = batch
                optimizer.zero_grad()
                predictions = model(text).squeeze(1)
                loss = criterion(predictions, labels.float())
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()
            
            print(f'Epoch {epoch+1}, Loss: {epoch_loss / len(dataloader)}')
        self.pt = model
    def save_models(self):        
        with open('RF.pkl', 'wb') as f:
            pickle.dump(self.RF, f)
        with open('GB.pkl', 'wb') as f:
            pickle.dump(self.GB, f)
        with open('LR.pkl', 'wb') as f:
            pickle.dump(self.LR, f)
        with open('OC.pkl', 'wb') as f:
            pickle.dump(self.OC, f)
        with open('vect.pkl', 'wb') as f:
            pickle.dump(self.vect, f)
        with open('PT.pkl', 'wb') as f:
            pickle.dump(self.pt, f)
        with open('vocab.pkl', 'wb') as f:
            pickle.dump(self.vocab, f)

    def predict(self, s=None):
        if s==None:
            sss = input()
        else:
            sss =s 
        sss = pd.DataFrame([sss], columns=["text"])
        sss["text"] = sss["text"].apply(self.removeCharacters)
        sss["text"] = sss["text"].apply(self.stem)
        nv = self.vect.transform(sss["text"])
        #self.m.eval()
        #tc = self.m(torch.tensor(scipy.sparse.csr_matrix.todense(nv)).float())
        #ps = torch.exp(tc)
        #tk, p = ps.topk(1, dim=1)
        self.p = self.RF.predict(nv)
        self.ms = self.OC.predict(nv)
        self.ns = self.LR.predict(nv)
        self.o = self.GB.predict(nv)
        ss = self.preprocess_data(sss, self.vocab)
        sss['sequences'] = ss
        max_length = 100
        ps = self.pad_sequences(ss, max_length)
        ip = torch.tensor(ps)
        self.op = self.pt(ip)
        
        if self.ms[0]==0:
            print("FAKE")
        elif self.ms[0] == 1:
            print("REAL")
        
        if self.ns == 0:
            print("FAKE")
        else:
            print("REAL")
        if self.o == 0:
            print("FAKE")
        else:
            print("REAL")
        if self.p == 0:
            print("FAKE")
        else:
            print("REAL")
        if self.op < 0.5:
            print("FAKE")
        else:
            print("REAL")

        return [self.ms.item(), self.ns.item(), self.o.item(),self.p.item(), self.op.item()]
