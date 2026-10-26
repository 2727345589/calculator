# 房算 · 提前还款决策台

> 支持等额本息与等额本金，输入一笔提前还款金额，实时比较「缩短月供」与「缩短年限」的月供、利息、期数和实际结清日期。

![房算 · 提前还款决策台](docs/preview-hero.jpg)

## 界面预览

### 等额本息测算

![等额本息提前还款测算](docs/preview-equal-interest.jpg)

输入面板与结果区实时联动，展示当前月供、剩余本金、原计划利息、推荐方案、三种方案对比、还款曲线、提前还款前后本金拆解和逐期还款计划。

### 等额本金测算

![等额本金提前还款测算](docs/preview-equal-principal.jpg)

切换至等额本金后，页面会额外展示首月月供、每月递减金额，以及首月月供中的本金和利息构成。

### 移动端

<p align="center">
  <img src="docs/preview-mobile.jpg" alt="移动端界面" width="360" />
</p>

<details>
<summary>查看完整页面长图</summary>

![完整页面预览](docs/preview-full.jpg)

</details>

## 功能详情

### 1. 两种还款方式

在输入面板中切换「等额本息 / 等额本金」，页面一次只展示当前选择的还款方式，不做两种方式并列比较。

| 还款方式 | 特点 | 页面展示 |
| --- | --- | --- |
| 等额本息 | 每月月供固定，前期利息占比较高 | 固定月供、首月本金与利息构成 |
| 等额本金 | 首月月供最高，之后每月递减，总利息通常更少 | 首月月供、每月递减金额、逐月还款计划 |

### 2. 提前还款双策略

| 策略 | 等额本息 | 等额本金 |
| --- | --- | --- |
| **缩短月供** | 剩余期限不变，重新计算固定月供 | 剩余期限不变，降低每月应还本金 |
| **缩短年限** | 保持原月供，压缩剩余期数 | 保持每月本金，压缩剩余期数 |

支持输入任意提前还款金额，自动处理部分提前还款、超额还款和一次性结清。最后一期金额会根据实际余额调整。

### 3. 决策偏好与智能推荐

可以在「省钱优先 / 月供优先 / 平衡」之间切换。系统会根据偏好比较两种提前还款方式，给出推荐方案，并说明：

- 可节省多少利息
- 新月供或新首月月供
- 提前多少期、多少年结清
- 预计实际结清日期
- 与另一种方案的差额

### 4. 结合实际日期

输入「下一期还款日期」后，后续每期日期自动按月顺延：

- 日期会展示在方案卡片、对比表、推荐结果和还款计划中
- 遇到月末会自动取当月最后一天
  - 例如：1 月 31 日 → 2 月 28 日 → 3 月 31 日
- 图表悬浮提示也会显示对应的实际还款日期

### 5. 可视化与逐期明细

- 还款曲线可切换「剩余本金」和「累计利息」
- 查看不提前还款、缩短月供、缩短年限三条路径对比
- 提前还款前后本金拆解
- 全维度方案对比表
- 可分页查看的逐期还款计划，包含日期、月供、本金、利息和剩余本金

### 6. 本地计算与隐私

所有计算都在浏览器本地完成，不上传贷款金额、利率或日期等任何数据。

## 技术栈

- React 19
- TypeScript
- Vite
- Recharts
- Lucide React
- 原生 CSS

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

默认开发地址为 `http://localhost:5173/`。

## 部署到 GitHub Pages

项目已包含 GitHub Actions 工作流：

```text
.github/workflows/deploy.yml
```

部署步骤：

1. 将项目推送到 GitHub 仓库的 `main` 分支。
2. 打开仓库 **Settings → Pages**。
3. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
4. 推送到 `main` 后，Actions 会自动构建并部署。
5. 部署完成后，在 Actions 运行详情或 Pages 设置中查看站点地址。

工作流使用 Node.js 22 和 `npm ci` 构建，并将 `dist/` 发布到 GitHub Pages。Vite 已配置相对路径 `base: "./"`，可适配仓库子路径部署。

Pull Request 只会执行构建检查，不会触发部署。

### 常见问题：Get Pages site failed

如果 Actions 报错：

```text
Error: Get Pages site failed. Please verify that the repository has Pages enabled...
```

表示仓库还没有启用 GitHub Pages，而不是构建失败。处理方式：

1. 打开仓库 **Settings → Pages**。
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
3. 回到 Actions，重新运行 `Deploy to GitHub Pages` 工作流。

不要直接设置 `enablement: true`。该选项需要额外的 Personal Access Token 或 GitHub App Token，默认的 `GITHUB_TOKEN` 无法为仓库启用 Pages。

如果 Settings 中找不到 Pages 选项，请确认仓库为公开仓库，或当前 GitHub 套餐支持私有仓库 Pages。

## 测算口径

### 执行利率

```text
执行年利率 = 五年期以上 LPR + 加点
1 BP = 0.01%
```

例如：LPR 3.50%，加点 -20 BP，则执行年利率为 3.30%。

### 等额本息月供

```text
r = 执行年利率 / 12
M = P × r × (1 + r)^n / ((1 + r)^n - 1)
```

其中：

- `P`：当前剩余本金
- `r`：月利率
- `n`：剩余还款期数
- `M`：固定月供

### 等额本金月供

```text
r = 执行年利率 / 12
每月本金 = P / n
第 t 期月供 = P / n + 剩余本金 × r
```

等额本金首月月供最高，之后每月递减，每月递减金额为：

```text
每月递减 = (P / n) × r
```

### 提前还款

- 提前还款视为在当前时点即时冲抵本金。
- **等额本息**
  - 缩短月供：以提前还款后的剩余本金和原剩余期数重新计算固定月供。
  - 缩短年限：保持原月供，重新计算需要多少期还清。
- **等额本金**
  - 缩短月供：剩余期限不变，降低每月应还本金。
  - 缩短年限：保持每月应还本金，缩短还清所需期数。
- 最后一期金额会按实际余额调整，总还款额包含本次提前还款本金。

### 日期推算

- 以「下一期还款日期」为第 1 期。
- 后续各期按每月同日顺延。
- 若当月没有对应日期，则自动取当月最后一天。
  - 例如：1 月 31 日 → 2 月 28 日 → 3 月 31 日。
- 预计结清日期按最后一期还款日期展示。

### 未考虑因素

实际办理提前还款时，可能还涉及以下因素，本工具暂未计入：

- 提前还款违约金或手续费
- 银行按日计息规则
- 利率重定价、LPR 未来变化
- 提前还款次数和间隔限制
- 银行取整与末期金额规则差异

测算结果仅供决策参考，实际金额和日期请以贷款银行合同及最新还款规则为准。

## 项目结构

```text
calculator/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Pages 部署
├── docs/
│   ├── preview-hero.jpg
│   ├── preview-equal-interest.jpg
│   ├── preview-equal-principal.jpg
│   ├── preview-full.jpg
│   └── preview-mobile.jpg
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ComparisonTable.tsx    # 全维度对比表
│   │   ├── InputPanel.tsx         # 贷款与提前还款参数输入
│   │   ├── Methodology.tsx        # 测算口径说明
│   │   ├── PrepaymentSnapshot.tsx # 提前还款前后本金拆解
│   │   ├── RecommendationBanner.tsx
│   │   ├── RepaymentChart.tsx     # 还款曲线
│   │   ├── ScenarioCards.tsx      # 三种方案卡片
│   │   ├── ScheduleTable.tsx      # 逐期还款计划
│   │   └── SummaryStats.tsx       # 顶部指标
│   ├── lib/
│   │   ├── date.ts                # 日期解析、顺延与格式化
│   │   ├── format.ts              # 金额与数字格式化
│   │   └── loan.ts                # 等额本息/等额本金与提前还款计算
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 浏览器支持

建议使用最新版本的 Chrome、Safari、Edge 或 Firefox。日期输入使用原生 `<input type="date">`，不同系统上的显示格式可能略有差异，页面下方会同步展示统一的中文日期。
