// 清华售卖点调查问卷 - Deno Deploy 简化版
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// 数据存储
let surveyData: any[] = [];

// 管理密码
const ADMIN_PASSWORD = "tsinghua2024";

// 简化的 HTML 页面
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>清华售卖点调查</title>
<style>
body{font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5}
.card{background:white;border-radius:10px;padding:20px;margin-bottom:15px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
h1{color:#5B2D8E;text-align:center}
label{display:block;margin:10px 0 5px;font-weight:bold}
input[type=text]{width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;box-sizing:border-box}
.option{display:block;padding:10px;margin:5px 0;border:2px solid #ddd;border-radius:8px;cursor:pointer}
.option:hover{border-color:#5B2D8E;background:#f0e6ff}
.option.selected{border-color:#5B2D8E;background:#f0e6ff}
.btn{display:block;width:100%;padding:12px;margin:10px 0;background:#5B2D8E;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer}
.btn:hover{background:#7B4DBE}
.btn-secondary{background:#666}
.btn-success{background:#2E8B57}
.hidden{display:none}
.step-title{font-size:18px;font-weight:bold;color:#5B2D8E;margin-bottom:10px}
.progress{height:5px;background:#ddd;border-radius:3px;margin-bottom:20px}
.progress-bar{height:100%;background:#5B2D8E;border-radius:3px;transition:width 0.3s}
.text-center{text-align:center}
.note{font-size:12px;color:#999}
</style>
</head>
<body>

<div id="welcomePage">
  <div class="card">
    <h1>🏫 清华校内零食饮料售卖点调查</h1>
    <p class="text-center">帮助我们了解校园内的售卖点情况</p>
    <button class="btn" onclick="startSurvey()">开始填写</button>
  </div>
</div>

<div id="surveyPage" class="hidden">
  <div class="progress"><div class="progress-bar" id="progressBar" style="width:0%"></div></div>
  
  <div id="step1" class="card">
    <div class="step-title">步骤 1：售卖点位置</div>
    <label>请输入售卖点精确位置（到楼层）</label>
    <input type="text" id="location" placeholder="例如：紫荆公寓3号楼1层">
  </div>

  <div id="step2" class="card hidden">
    <div class="step-title">步骤 2：售卖点分类</div>
    <div id="typeOptions"></div>
  </div>

  <div id="step3" class="card hidden">
    <div class="step-title">步骤 3：品类情况</div>
    <div id="categoryOptions"></div>
  </div>

  <div id="step4" class="card hidden">
    <div class="step-title">步骤 4：品类丰富度</div>
    <div id="richnessOptions"></div>
  </div>

  <div id="step5" class="card hidden">
    <div class="step-title">步骤 5：消费档次</div>
    <div id="priceOptions"></div>
  </div>

  <div id="step6" class="card hidden">
    <div class="step-title">步骤 6：是否涨价</div>
    <div id="priceChangeOptions"></div>
  </div>

  <div id="step7" class="card hidden">
    <div class="step-title">步骤 7：营业时间</div>
    <div id="hoursOptions"></div>
  </div>

  <button class="btn" id="nextBtn" onclick="nextStep()">下一步</button>
</div>

<div id="thankyouPage" class="hidden">
  <div class="card text-center">
    <h1>✅ 感谢您的填写！</h1>
    <p>您的反馈对我们很重要</p>
    <button class="btn btn-success" onclick="location.reload()">填写另一个地点</button>
  </div>
</div>

<script>
// 数据定义
const types = ['自动贩卖机','小卖部','食堂','零食集合店','超市','奶茶饮料店','餐厅','咖啡店','有人售卖的冰柜'];
const categories = ['零食','饮料','零食饮料','奶茶咖啡','奶茶咖啡小吃'];
const richness = ['基础（宿舍楼下自动贩卖机级别）','丰富（小卖部级）','非常丰富（超市级别）'];
const prices = ['生活保障','小贵','奢华享受'];
const priceChanges = ['平价','小涨','大涨'];
const hours = ['24小时','日间（含晚餐时间）','全天（含夜宵时间）','下午','上午'];

let currentStep = 1;
let selectedData = {};

function startSurvey() {
  document.getElementById('welcomePage').classList.add('hidden');
  document.getElementById('surveyPage').classList.remove('hidden');
  showStep(1);
  renderOptions('typeOptions', types, 'type');
  renderOptions('categoryOptions', categories, 'category');
  renderOptions('richnessOptions', richness, 'richness');
  renderOptions('priceOptions', prices, 'price');
  renderOptions('priceChangeOptions', priceChanges, 'priceChange');
  renderOptions('hoursOptions', hours, 'hours');
}

function showStep(step) {
  for (let i = 1; i <= 7; i++) {
    document.getElementById('step' + i).classList.add('hidden');
  }
  document.getElementById('step' + step).classList.remove('hidden');
  document.getElementById('progressBar').style.width = ((step - 1) / 7 * 100) + '%';
  currentStep = step;
}

function renderOptions(containerId, options, field) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'option';
    div.textContent = opt;
    div.onclick = function() {
      container.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedData[field] = opt;
    };
    container.appendChild(div);
  });
}

function nextStep() {
  if (currentStep === 1) {
    const loc = document.getElementById('location').value.trim();
    if (!loc) { alert('请填写位置'); return; }
    selectedData.location = loc;
  }
  if (currentStep < 7) {
    if (!selectedData[['type','category','richness','price','priceChange','hours'][currentStep - 2]]) {
      alert('请选择选项');
      return;
    }
    showStep(currentStep + 1);
  } else {
    if (!selectedData.hours) { alert('请选择营业时间'); return; }
    submitData();
  }
}

async function submitData() {
  const record = {
    ...selectedData,
    timestamp: new Date().toISOString(),
    sessionId: 'S' + Date.now().toString(36)
  };
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(record)
    });
    if (res.ok) {
      document.getElementById('surveyPage').classList.add('hidden');
      document.getElementById('thankyouPage').classList.remove('hidden');
    } else {
      alert('提交失败，请重试');
    }
  } catch(e) {
    alert('网络错误，请重试');
  }
}
</script>
</body>
</html>`;

// HTTP 服务器
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (url.pathname === "/api/submit" && req.method === "POST") {
    try {
      const body = await req.json();
      surveyData.push({ id: "R" + Date.now(), ...body });
      console.log("新提交:", body.location, "总计:", surveyData.length);
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ success: false }), { status: 400, headers });
    }
  }

  if (url.pathname === "/api/data" && req.method === "GET") {
    return new Response(JSON.stringify(surveyData), { headers });
  }

  if (url.pathname === "/api/clear" && req.method === "POST") {
    surveyData = [];
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

serve(handler);
console.log("服务器已启动");
