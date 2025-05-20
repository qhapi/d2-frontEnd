# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = Flask(__name__)
CORS(app)  # 启用CORS

# 全局加载模型
model = None
tokenizer = None
id2label = {0: "无漏洞", 1: "存在高危漏洞"}

def load_model():
    global model, tokenizer
    model_path = "/data/qiguiyue/qwen2/integeroverflow/seqcls"
    base_model_name = "Alibaba-NLP/gte-Qwen2-7B-instruct"
    
    tokenizer = AutoTokenizer.from_pretrained(base_model_name)
    tokenizer.add_special_tokens({'pad_token': '<|endoftext|>'})
    
    model = AutoModelForSequenceClassification.from_pretrained(
        model_path,
        trust_remote_code=True,
        torch_dtype=torch.float16,
        device_map="auto",
        low_cpu_mem_usage=True
    )
    model.eval()

@app.before_first_request
def initialize():
    load_model()

@app.route('/api/detect', methods=['POST'])
def detect():
    try:
        data = request.json
        contract_code = data.get('code', '')
        
        inputs = tokenizer(
            contract_code,
            max_length=512,
            truncation=True,
            padding=True,
            return_tensors="pt"
        ).to(model.device)

        with torch.no_grad():
            outputs = model(**inputs)

        result = {
            "status": "success",
            "result": id2label[outputs.logits.argmax().item()],  # 使用实际预测结果
            "confidence": torch.nn.functional.softmax(outputs.logits, dim=1)[0].max().item(),
            "vulnerabilities": []  # 默认设为空数组
        }
        print(id2label[outputs.logits.argmax().item()])
        if outputs.logits.argmax().item() == 1:
            result["vulnerabilities"].append({
                "type": "integeroverflow",
                "severity": "高危",
                "description": "检测到integeroverflow漏洞",
                "position": "NA"
            })        

        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)