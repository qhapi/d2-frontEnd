from flask import Flask, request, jsonify
import subprocess
import uuid
import os
import re
import shutil
from pathlib import Path
import threading
from flask_cors import CORS
from threading import Lock

analysis_lock = Lock()

app = Flask(__name__)
CORS(app)  # 允许所有跨域请求
# 配置参数
UPLOAD_DIR = Path("uploads")
RESULTS_DIR = Path("results")
ALLOWED_EXTENSIONS = {'sol'}
TASKS = {}

# 初始化目录
UPLOAD_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def analyze_task(task_id, file_path, tool="conkas", timeout=600):
    
    """后台分析任务"""
    try:
        with analysis_lock:
            # 执行漏洞检测命令
            cmd = [
                "/data/zhouyun/bugfinder/bugfinders",
                "-t", tool,
                "-f", str(file_path),
                "--timeout", str(timeout),
                "--results", str(RESULTS_DIR / task_id)  # 为每个任务创建独立目录
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )

            # 解析结果日志
            log_path = find_result_log(task_id, file_path.name)
            print("log_path:", log_path)
            vulnerabilities = parse_log(log_path)
            
            # 更新任务状态
            TASKS[task_id] = {
                "status": "completed",
                "vulnerabilities": vulnerabilities,
                "log": result.stdout
            }

    except subprocess.CalledProcessError as e:
        TASKS[task_id] = {
            "status": "failed",
            "log": f"{e.stderr}\nExit code: {e.returncode}"
        }
    finally:
        # 清理上传文件
        shutil.rmtree(file_path.parent)


def find_result_log(task_id, filename):
    """根据任务ID查找日志"""
    task_dir = RESULTS_DIR / task_id
    print("task_dir:", task_dir)
    if not task_dir.exists():
        return None
    return task_dir / "result.log"

def parse_log(log_path):
    """解析漏洞日志"""
    if not log_path or not log_path.exists():
        return []
    
    pattern = re.compile(
        r"Vulnerability: (.*?)\. Maybe in function: (.*?)\. PC:.*Line number: (\d+)\."
    )
    
    vulns = []
    with open(log_path) as f:
        for line in f:
            if match := pattern.search(line):
                vuln_type, function, line_no = match.groups()
                vulns.append({
                    "type": vuln_type.strip(),
                    "function": function.strip(),
                    "line": line_no.strip(),
                    "description": line.strip()
                })
    return vulns

@app.route('/analyze', methods=['POST'])
def analyze():
    """启动分析任务"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if not file or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    # 生成任务ID
    task_id = str(uuid.uuid4())
    task_dir = UPLOAD_DIR / task_id
    task_dir.mkdir(exist_ok=True)
    
    # 保存文件
    file_path = task_dir / file.filename
    file.save(file_path)
    
    # 初始化任务状态
    TASKS[task_id] = {"status": "processing"}
    
    # 启动后台线程
    thread = threading.Thread(
        target=analyze_task,
        args=(task_id, file_path)
    )
    thread.start()
    
    return jsonify({
        "task_id": task_id,
        "status": "processing",
        "message": "Analysis started"
    })

@app.route('/results/<task_id>', methods=['GET'])
def get_results(task_id):
    """获取分析结果"""
    task = TASKS.get(task_id)
    if not task:
        return jsonify({"error": "Invalid task ID"}), 404
    
    response = {
        "status": task["status"],
        "log": task.get("log", "")
    }
    
    if task["status"] == "completed":
        response["vulnerabilities"] = task.get("vulnerabilities", [])
        print("Vulnerabilities:", task["vulnerabilities"])
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5010, threaded=True)