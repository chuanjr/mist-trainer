// MIST Trainer — Scenario Data (台灣自訓團戰時情境)
// 15 scenarios: 5 extreme-pressure (20s) + 5 pressure (30s) + 5 standard (120s)

const SCENARIOS = [
  // ── 極限壓力（5 個）── timeLimitSec: 20 ─────────────────────────────────
  {
    id: "s01",
    title: "股動脈大出血——IED 爆炸",
    mechanism: "台北信義區街道遭 IED 引爆，傷患左大腿被彈片切斷股動脈，大量噴射性出血。",
    patient: { age: 22, sex: "M", GCS: 12, bp: "74/40", hr: 138, rr: 28, spo2: 94 },
    injuries: "左大腿近端股動脈撕裂傷，傷口大量噴射性出血；左小腿骨折，皮膚撕脫；右前臂多發彈片傷。",
    signs: "意識混亂（GCS 12）；皮膚蒼白濕冷；BP 74/40 mmHg，HR 138 bpm，RR 28 次/分，SpO2 94%；左大腿持續大量出血，尚未止血。",
    treatment: "立即於左腹股溝近端施打 TQ（記錄時間）；傷口處使用 Combat Gauze 填塞加壓；開放靜脈通路（IV/IO）輸注生理食鹽水；氧氣面罩給氧；呼叫後送並通報傷情。",
    timeLimitSec: 20,
    difficulty: "pressure"
  },
  {
    id: "s02",
    title: "頸部穿刺傷——狙擊槍傷",
    mechanism: "高雄左營軍港附近，傷患遭狙擊手射擊，子彈穿過頸部右側，大量出血合併呼吸困難。",
    patient: { age: 28, sex: "M", GCS: 11, bp: "80/50", hr: 142, rr: 32, spo2: 89 },
    injuries: "右頸穿透傷，頸靜脈/頸動脈區域出血；氣管偏移疑慮；無出口傷。",
    signs: "意識模糊（GCS 11）；頸部右側大量外出血；聲音嘶啞、呼吸費力；BP 80/50 mmHg，HR 142 bpm，RR 32 次/分，SpO2 89%；JVD 陰性。",
    treatment: "戴手套直接加壓止血（勿環繞整個頸部）；使用 HemCon 或 Combat Gauze 填塞；評估氣道，必要時準備 ET 插管或環甲膜切開；開放 IV/IO；緊急後送，通報外科介入需求。",
    timeLimitSec: 20,
    difficulty: "pressure"
  },
  {
    id: "s03",
    title: "雙下肢離斷——反裝甲地雷",
    mechanism: "台中清水一帶，裝甲車輛觸發反裝甲地雷，乘員被甩出車外，雙下肢於膝關節以下離斷。",
    patient: { age: 31, sex: "M", GCS: 9, bp: "68/38", hr: 148, spo2: 91 },
    injuries: "雙下肢膝關節以下截斷性離斷；殘端大量出血；骨盆骨折疑慮；意識明顯下降。",
    signs: "意識嚴重下降（GCS 9）；雙殘端噴射性出血；皮膚灰白，四肢冰冷；BP 68/38 mmHg，HR 148 bpm，SpO2 91%；無 RR 可靠數值（張口呼吸）。",
    treatment: "雙側殘端各施打 TQ 於最近端；骨盆纏繞骨盆固定帶（Pelvic Binder）；建立雙 IV/IO，輸注血液製品或生理食鹽水（容許性低血壓目標 BP ≥80 mmHg）；覆蓋保暖毯預防低體溫；最高優先後送。",
    timeLimitSec: 20,
    difficulty: "pressure"
  },
  {
    id: "s04",
    title: "張力性氣胸——砲彈破片",
    mechanism: "台南永康地區遭砲彈攻擊，傷患胸部左側受多塊破片貫穿，現場出現急速惡化的呼吸困難。",
    patient: { age: 35, sex: "F", GCS: 10, bp: "72/42", hr: 144, rr: 36, spo2: 84 },
    injuries: "左胸多發穿透性破片傷；張力性氣胸（氣管右偏）；皮下氣腫。",
    signs: "意識惡化（GCS 10）；氣管明顯右偏；左肺呼吸音消失；JVD 陽性；BP 72/42 mmHg，HR 144 bpm，RR 36 次/分，SpO2 84%；發紺。",
    treatment: "立即針刺減壓（第 2 肋間鎖骨中線或第 4/5 肋間腋前線）；封閉所有胸壁傷口（三面封閉敷料）；給氧；開放 IV；緊急後送準備胸腔引流。",
    timeLimitSec: 20,
    difficulty: "pressure"
  },
  {
    id: "s05",
    title: "心跳停止——爆炸波衝擊",
    mechanism: "桃園龜山工業區遭無人機自殺式攻擊，傷患距爆炸中心 5 公尺，被爆炸超壓波衝擊後立即倒地。",
    patient: { age: 40, sex: "M", GCS: 3, bp: "不可測", hr: 0, rr: 0 },
    injuries: "爆炸波致心臟震盪疑慮；全身多發鈍傷；雙側鼓膜破裂；肺挫傷疑慮；無明顯外部大出血。",
    signs: "無意識（GCS 3）；無頸動脈脈搏；無自發呼吸；雙耳出血；腹部膨脹；無可測 BP、HR、RR、SpO2。",
    treatment: "確認場景安全後立即開始 CPR（30:2 壓胸與呼吸）；使用 AED 評估心律；開放 IO 輸液；排除可逆性原因（4H4T）：張力性氣胸→針刺減壓；呼叫進階急救支援；持續 CPR 至後送或 ROSC。",
    timeLimitSec: 20,
    difficulty: "pressure"
  },

  // ── 壓力（5 個）── timeLimitSec: 30 ──────────────────────────────────────
  {
    id: "s06",
    title: "多發彈片傷——無人機攻擊",
    mechanism: "新北板橋民宅區遭無人機投彈攻擊，傷患在街道上被多枚鋼珠型彈片擊中，倒於路旁。",
    patient: { age: 45, sex: "M", GCS: 14, bp: "92/58", hr: 120, rr: 24, spo2: 95 },
    injuries: "左上臂貫穿傷（疑橈動脈受損）；右腹部破片傷（腹膜刺激徵象）；右小腿軟組織撕裂；背部多發淺表彈片嵌入。",
    signs: "意識尚可（GCS 14）；焦慮、面色蒼白；左上臂傷口持續滲血；腹部壓痛及輕度肌衛；BP 92/58 mmHg，HR 120 bpm，RR 24 次/分，SpO2 95%。",
    treatment: "左上臂 TQ 施打；腹部傷口以無菌敷料覆蓋（勿移除異物）；開放 IV，容許性低血壓管理（目標收縮壓 ≥80 mmHg）；頸椎保護（頸圈固定）；止痛評估；緊急後送至外科中心。",
    timeLimitSec: 30,
    difficulty: "pressure"
  },
  {
    id: "s07",
    title: "腹股溝出血合併失血性休克——建築倒塌",
    mechanism: "台北大安區建築物遭砲擊倒塌，救援人員將傷患從廢墟中拉出，發現腹股溝嚴重撕裂傷。",
    patient: { age: 38, sex: "F", GCS: 13, bp: "84/52", hr: 130, rr: 26, spo2: 93 },
    injuries: "右腹股溝深層撕裂傷（股靜脈疑損傷）；骨盆環破裂疑慮；右股骨骨折；胸部多發肋骨骨折。",
    signs: "意識略降（GCS 13）；右腹股溝大量活動性出血；骨盆擠壓試驗不穩定；BP 84/52 mmHg，HR 130 bpm，RR 26 次/分，SpO2 93%；皮膚濕冷。",
    treatment: "腹股溝使用 TQ 或 Junctional TQ（JETT/SAM-JT）；骨盆固定帶圍纏；開放雙側 IV/IO，輸注血液製品優先；股骨骨折暫時夾板固定；氧氣給予；緊急後送。",
    timeLimitSec: 30,
    difficulty: "pressure"
  },
  {
    id: "s08",
    title: "燃燒彈致全身燒傷合併吸入性損傷",
    mechanism: "高雄楠梓化工廠遭白磷燃燒彈攻擊，傷患試圖撲滅衣物上的燃燒物，導致全身多處燒傷並吸入大量有毒煙霧。",
    patient: { age: 29, sex: "M", GCS: 13, bp: "100/64", hr: 118, rr: 30, spo2: 90 },
    injuries: "臉部、頸部、雙上肢及前胸二至三度燒傷（估計 35% TBSA）；口鼻焦黑、鼻毛燒焦（吸入性損傷）；白磷殘留灼燒疑慮。",
    signs: "意識略降（GCS 13）；聲音沙啞、喘鳴；口鼻周圍碳黑沉積；皮膚水泡及焦痂；BP 100/64 mmHg，HR 118 bpm，RR 30 次/分，SpO2 90%；嚴重疼痛。",
    treatment: "立即移除仍在燃燒的衣物（白磷需用水浸濕隔絕氧氣）；高流量氧氣給予（100% O2 面罩）；評估氣道，早期考慮 ET 插管（喘鳴惡化前）；大量 IV 輸液（Parkland 公式）；無菌濕敷料覆蓋燒傷區域；嗎啡 IV 止痛；緊急後送。",
    timeLimitSec: 30,
    difficulty: "pressure"
  },
  {
    id: "s09",
    title: "撤離車禍——大規模傷亡首位傷患",
    mechanism: "民眾從台中市區沿台一線撤離時，車輛追撞造成多車連環事故，大量傷患散落路面，需快速檢傷分類。",
    patient: { age: 55, sex: "F", GCS: 12, bp: "88/56", hr: 126, rr: 28, spo2: 92 },
    injuries: "頭部鈍傷（前額撕裂、顱骨骨折疑慮）；胸部鈍傷（多發肋骨骨折、血胸疑慮）；右腕橈骨骨折；腹部鈍傷（脾臟損傷疑慮）。",
    signs: "意識混亂（GCS 12）；前額大量出血；右側胸廓擴張受限，叩診濁音；腹部壓痛；BP 88/56 mmHg，HR 126 bpm，RR 28 次/分，SpO2 92%；四肢冰冷。",
    treatment: "START 分類標記為紅色（立即）；頭部傷口直接加壓止血；頸椎固定；氧氣給予；開放 IV，謹慎輸液（血胸疑慮下）；腕部夾板固定；後送至創傷中心，通報多車事故人數。",
    timeLimitSec: 30,
    difficulty: "pressure"
  },
  {
    id: "s10",
    title: "爆炸性眼傷合併 TBI——手榴彈近爆",
    mechanism: "新竹湖口訓練場附近，訓練用手榴彈意外在隊員身旁 2 公尺處爆炸，爆炸破片擊中臉部及頭部。",
    patient: { age: 21, sex: "M", GCS: 11, bp: "96/62", hr: 115, rr: 22, spo2: 96 },
    injuries: "右眼穿透傷（眼球破裂疑慮）；前額及臉部多發破片傷；疑似輕至中度 TBI（失憶、定向感障礙）；雙側耳鳴、鼓膜破裂。",
    signs: "意識混亂（GCS 11）；無法說出受傷經過；右眼腫脹閉合、血性分泌物；雙耳出血；BP 96/62 mmHg，HR 115 bpm，RR 22 次/分，SpO2 96%；頭痛、惡心。",
    treatment: "右眼以剛性眼罩（Fox shield）保護，勿施壓；臉部傷口加壓止血；頸椎保護；給氧；開放 IV；GCS 及瞳孔反應每 5 分鐘記錄一次；勿給 NSAID/Aspirin（顱內出血疑慮）；後送至神經外科。",
    timeLimitSec: 30,
    difficulty: "pressure"
  },

  // ── 標準（5 個）── timeLimitSec: 120 ────────────────────────────────────
  {
    id: "s11",
    title: "火災煙霧吸入——砲擊後建築起火",
    mechanism: "台北萬華一棟老舊公寓遭砲擊引發火災，消防人員進入救援後，發現一名被困居民已吸入大量濃煙。",
    patient: { age: 68, sex: "F", GCS: 14, bp: "148/88", hr: 108, rr: 22, spo2: 88 },
    injuries: "吸入性損傷（碳氧血紅素升高疑慮）；無明顯外傷；輕微臉部皮膚紅斑；意識清楚但混亂。",
    signs: "意識清楚但混亂（GCS 14）；持續咳嗽、黑色痰液；口唇微紫或鮮紅（CO 中毒）；SpO2 88%；BP 148/88 mmHg，HR 108 bpm，RR 22 次/分；頭痛、暈眩。",
    treatment: "立即移至新鮮空氣處；高流量 100% O2（非重吸入面罩，至少 6 小時）；建立 IV 通路；連續生命徵象監測；考慮高壓氧（HBO）治療；若意識惡化準備 ET 插管；後送至醫院確認 COHb 濃度。",
    timeLimitSec: 120,
    difficulty: "standard"
  },
  {
    id: "s12",
    title: "壓砸症候群——建築廢墟受困數小時",
    mechanism: "台南安平區建築物遭無人機炸毀，救援隊於 6 小時後挖出一名被混凝土壓住雙腿的男性傷患。",
    patient: { age: 50, sex: "M", GCS: 14, bp: "104/68", hr: 104, rr: 20, spo2: 97 },
    injuries: "雙下肢長時間壓迫（壓砸症候群）；下肢腫脹、皮膚紅斑及張力性水泡；高鉀血症及橫紋肌溶解疑慮；無明顯骨折移位。",
    signs: "意識清楚（GCS 14）；下肢明顯腫脹，觸感木硬；尿液呈茶褐色（肌紅蛋白尿）；BP 104/68 mmHg，HR 104 bpm，RR 20 次/分，SpO2 97%；麻木刺痛；肌力下降。",
    treatment: "解壓前先建立 IV，開始大量生理食鹽水（1–1.5 L/hr）以預防再灌流損傷；心電監測（高鉀血症 peaked T wave）；移除壓迫物（緩慢）；下肢輕敷料包紮，勿抬高；處置高鉀血症（Calcium gluconate, NaHCO3）；緊急後送，密切監測尿量 ≥200 mL/hr。",
    timeLimitSec: 120,
    difficulty: "standard"
  },
  {
    id: "s13",
    title: "開放性骨盆骨折——車輛爆炸翻覆",
    mechanism: "基隆港附近，軍用卡車遭 IED 攻擊翻覆，駕駛被拋出車外，骨盆受嚴重撞擊。",
    patient: { age: 33, sex: "M", GCS: 13, bp: "90/58", hr: 124, rr: 24, spo2: 95 },
    injuries: "開放性骨盆環骨折（Tile C 型疑慮）；腹股溝至會陰區撕裂傷；腹腔臟器損傷疑慮；左肩關節脫位；頭皮撕裂傷。",
    signs: "意識略降（GCS 13）；骨盆不穩定（彈性壓痛）；會陰區大量出血；腹部膨脹（腹腔積血疑慮）；BP 90/58 mmHg，HR 124 bpm，RR 24 次/分，SpO2 95%。",
    treatment: "立即施用骨盆固定帶（SAM Pelvic Sling），勿反覆評估骨盆穩定性；會陰傷口加壓包紮；開放雙 IV/IO 輸液；左肩簡單懸吊固定；頭皮加壓止血；持續監測生命徵象；後送至創傷外科。",
    timeLimitSec: 120,
    difficulty: "standard"
  },
  {
    id: "s14",
    title: "爆炸波 TBI——近距離砲彈衝擊",
    mechanism: "台中大肚山演習場附近遭砲擊，傷患距爆炸點約 8 公尺，被爆炸超壓波擊倒，短暫失去意識後自行清醒。",
    patient: { age: 26, sex: "M", GCS: 14, bp: "132/80", hr: 96, rr: 18, spo2: 98 },
    injuries: "爆炸波輕度 TBI（mTBI）；雙耳鼓膜破裂；暫時性失憶（事件前後各約 10 分鐘）；無明顯外傷性出血；輕微鼻出血。",
    signs: "意識清楚（GCS 14）；頭痛 7/10 分；光線及噪音過敏；雙耳聽力下降；BP 132/80 mmHg，HR 96 bpm，RR 18 次/分，SpO2 98%；步態略不穩（前庭功能受損）。",
    treatment: "進行神經學評估（MACE 2 量表）；頸椎評估排除頸傷；鼻出血壓迫止血；避免 NSAIDs（改用 Acetaminophen 止痛）；觀察紅旗症狀（頭痛加劇、嘔吐、意識下降）；至少 24 小時休息，症狀消失前不得返回任務；後送至醫療站評估 CT。",
    timeLimitSec: 120,
    difficulty: "standard"
  },
  {
    id: "s15",
    title: "大規模傷亡檢傷——砲擊後 10 名傷患",
    mechanism: "台北松山機場附近遭砲擊，10 名平民及自訓團隊員受傷，你是首批抵達的急救人員，需快速執行 START 檢傷。",
    patient: { age: 42, sex: "F", GCS: 15, bp: "118/74", hr: 98, rr: 18, spo2: 97 },
    injuries: "（代表性傷患）左前臂彈片傷、輕度撕裂；右踝扭傷；無危及生命傷害。",
    signs: "意識清楚（GCS 15）；可自行行走；左前臂輕度出血（已自行加壓）；BP 118/74 mmHg，HR 98 bpm，RR 18 次/分，SpO2 97%；中度疼痛。",
    treatment: "依 START 分類：可行走→綠色（延遲）；通知指揮官現場傷患總數及分類結果（紅:黃:綠:黑比例）；優先處理紅色傷患（大出血、無呼吸）；設立傷患集結點（CCP）；呼叫後送資源；本傷患：傷口清潔包紮，踝部固定，等待後送。",
    timeLimitSec: 120,
    difficulty: "standard"
  }
];

if (typeof module !== "undefined") module.exports = { SCENARIOS };
