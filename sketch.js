// 中央角色與下方多狀態精靈動畫範例
// 中央：使用 '角色/全部.png'（原有）
// 下方：顯示 idle/walk/run/attack 四種狀態，按鍵控制

let spriteImg; // 中央的舊精靈（如果有）
const SRC_W = 61; // 若有，保留原來的 source 設定
const SRC_H = 78;
let FRAMES = 0;
const DISPLAY_W = 56;
const DISPLAY_H = 78;
let frameIndex = 0;
let lastFrameTime = 0;
const FRAME_DURATION = 60;

// 下方多狀態精靈
let idleImg, walkImg, runImg, attackImg;
const anims = {
  idle: { img: null, frames: 2, srcW: 0, srcH: 0, dispW: 0, dispH: 0 },
  walk: { img: null, frames: 4, srcW: 0, srcH: 0, dispW: 0, dispH: 0 },
  run:  { img: null, frames: 4, srcW: 0, srcH: 0, dispW: 0, dispH: 0 },
  attack: { img: null, frames: 3, srcW: 0, srcH: 0, dispW: 0, dispH: 0 }
};

let currentAnimKey = 'idle';
let prevAnimKey = 'idle';
let isAttack = false;
let bottomFrameIndex = 0;
let bottomLastFrameTime = 0;
const BOTTOM_FRAME_DURATION = 100; // 可調整播放速度

// 下方角色位置與方向
let bottomX = 0; // 初始位置（會在 setup 中設定為 width / 2）
let bottomY = 0;
let direction = 1; // 1 = 右, -1 = 左
const MOVE_SPEED = 3; // 走路速度（像素/幀，可調整）
const RUN_SPEED = 6;  // 跑步速度（像素/幀，可調整）

function preload() {
  // 中央精靈（如果你的專案需要保留）
  spriteImg = loadImage('角色/全部.png');

  // 下方四種狀態的精靈表
  idleImg = loadImage('角色/全部停止.png');      // 2 幀, 總尺寸 147 x 85
  walkImg = loadImage('角色/全部走路.png');      // 4 幀, 總尺寸 247 x 91
  runImg  = loadImage('角色/全部跑步.png');      // 4 幀, 總尺寸 391 x 81
  attackImg = loadImage('角色/全部攻擊.png');   // 3 幀, 總尺寸 400 x 77
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  // 中央精靈的幀數（若沒有載入成功這行不會造成錯誤）
  if (spriteImg) {
    FRAMES = Math.max(1, Math.floor(spriteImg.width / SRC_W));
  }
  lastFrameTime = millis();

  // 設定下方各精靈屬性（依載入後的圖檔計算每格寬度）
  anims.idle.img = idleImg;
  anims.walk.img = walkImg;
  anims.run.img = runImg;
  anims.attack.img = attackImg;

  // 想要下方動畫顯示的高度（像素），可調整此值
  const bottomDisplayH = 78; // 例如 78px 高

  for (let k in anims) {
    const a = anims[k];
    if (a.img) {
      a.srcW = Math.max(1, a.img.width / a.frames);
      a.srcH = a.img.height;
      // 保持高度為 bottomDisplayH，計算寬度以保持比例
      const scale = bottomDisplayH / a.srcH;
      a.dispH = a.srcH * scale;
      a.dispW = a.srcW * scale;
    }
  }

  bottomLastFrameTime = millis();
  
  // 初始化下方角色位置
  bottomX = width / 2;
  bottomY = height - 40; // 離底部約 40px
}

function draw() {
  background('#9cfc97');

  // --- 中央原本的動畫（保持不變） ---
  if (spriteImg && FRAMES > 0) {
    if (millis() - lastFrameTime > FRAME_DURATION) {
      frameIndex = (frameIndex + 1) % FRAMES;
      lastFrameTime = millis();
    }
    const sx = frameIndex * SRC_W;
    const sy = 0;
    noTint();
    image(spriteImg, width / 2, height / 2, DISPLAY_W, DISPLAY_H, sx, sy, SRC_W, SRC_H);
  }

  // --- 下方狀態機與移動控制 ---
  if (!isAttack) {
    let currentSpeed = MOVE_SPEED; // 預設為走路速度
    
    // 按住 d 向右走；若同時按住 shift，改為跑步
    if (keyIsDown(68)) { // 'd'
      if (direction !== 1) {
        direction = 1; // 面向右
        bottomFrameIndex = 0;
      }
      if (keyIsDown(16)) { // shift
        if (currentAnimKey !== 'run') { currentAnimKey = 'run'; bottomFrameIndex = 0; }
        currentSpeed = RUN_SPEED; // 跑步速度
      } else {
        if (currentAnimKey !== 'walk') { currentAnimKey = 'walk'; bottomFrameIndex = 0; }
        currentSpeed = MOVE_SPEED; // 走路速度
      }
      // 向右移動
      bottomX += currentSpeed;
    } 
    // 按住 a 向左走；若同時按住 shift，改為跑步
    else if (keyIsDown(65)) { // 'a'
      if (direction !== -1) {
        direction = -1; // 面向左
        bottomFrameIndex = 0;
      }
      if (keyIsDown(16)) { // shift
        if (currentAnimKey !== 'run') { currentAnimKey = 'run'; bottomFrameIndex = 0; }
        currentSpeed = RUN_SPEED; // 跑步速度
      } else {
        if (currentAnimKey !== 'walk') { currentAnimKey = 'walk'; bottomFrameIndex = 0; }
        currentSpeed = MOVE_SPEED; // 走路速度
      }
      // 向左移動
      bottomX -= currentSpeed;
    } 
    else {
      if (currentAnimKey !== 'idle') { currentAnimKey = 'idle'; bottomFrameIndex = 0; }
    }
  }

  // 約束角色不超出畫面邊界（可選）
  bottomX = constrain(bottomX, 0, width);

  // --- 更新下方動畫幀 ---
  const curAnim = anims[currentAnimKey];
  if (curAnim && curAnim.img) {
    if (millis() - bottomLastFrameTime > BOTTOM_FRAME_DURATION) {
      bottomFrameIndex = (bottomFrameIndex + 1) % curAnim.frames;
      bottomLastFrameTime = millis();
    }

    // 如果正在攻擊且已播放到最後一幀，結束攻擊並回復先前狀態
    if (isAttack && bottomFrameIndex === curAnim.frames - 1) {
      // 結束攻擊狀態
      isAttack = false;
      currentAnimKey = prevAnimKey || 'idle';
      bottomFrameIndex = 0;
      bottomLastFrameTime = millis();
    }

    // 繪製下方動畫（使用 bottomX, bottomY 位置）
    const sx2 = bottomFrameIndex * curAnim.srcW;
    const sy2 = 0;
    
    noTint();
    // 保存變換矩陣
    push();
    translate(bottomX, bottomY);
    // 根據 direction 翻轉水平方向
    scale(direction, 1);
    image(curAnim.img, 0, 0, curAnim.dispW, curAnim.dispH, sx2, sy2, curAnim.srcW, curAnim.srcH);
    pop();
  }
}

// 當使用者按下左方向鍵，觸發攻擊動畫（完整播放後自動回復）
function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    // 只有在非攻擊時才觸發一次攻擊
    if (!isAttack) {
      prevAnimKey = currentAnimKey;
      currentAnimKey = 'attack';
      isAttack = true;
      bottomFrameIndex = 0;
      bottomLastFrameTime = millis();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
