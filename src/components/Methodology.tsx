import {
  Calculator,
  CalendarClock,
  CircleHelp,
  FileText,
  Landmark,
  ShieldCheck,
} from "lucide-react";

export function Methodology() {
  return (
    <section className="methodology" id="methodology">
      <div className="methodology-heading">
        <span className="section-kicker">测算口径</span>
        <h2>每一笔数字，都有据可循</h2>
        <p>
          以当前剩余本金和剩余期数为起点，按等额本息逐月摊还模型测算，提前还款视为即时冲抵本金。结清日期按下一期还款日逐月顺延，所有参数均在浏览器本地计算。实际银行可能因日计息、违约金、利率重定价与取整规则产生差异。
        </p>
      </div>

      <div className="methodology-grid">
        <article>
          <span className="method-icon">
            <Landmark size={18} />
          </span>
          <h3>执行利率</h3>
          <p>年利率 = 五年期以上 LPR + 加点；1BP = 0.01%，负加点代表利率下浮。</p>
        </article>
        <article>
          <span className="method-icon">
            <Calculator size={18} />
          </span>
          <h3>等额本息</h3>
          <p>
            月供按 P × r × (1+r)ⁿ ÷ [(1+r)ⁿ − 1] 计算，每月本金递增、利息递减。
          </p>
        </article>
        <article>
          <span className="method-icon">
            <CalendarClock size={18} />
          </span>
          <h3>缩短月供</h3>
          <p>期限保持不变，以提前还款后的剩余本金重新计算月供，期限与结清时间不变。</p>
        </article>
        <article>
          <span className="method-icon">
            <FileText size={18} />
          </span>
          <h3>缩短年限</h3>
          <p>月供维持原额，压缩剩余还款期数；因无法整除，最后一期金额会略有调整。</p>
        </article>
      </div>

      <div className="methodology-note">
        <div>
          <span>
            <CircleHelp size={15} />
            为什么两种方式省息不同？
          </span>
          <p>
            提前还款减少的是本金。缩短年限让高月供继续工作，本金下降更快，利息自然更少；缩短月供则把降下来的本金转化为每月现金流。没有绝对最优，只有更匹配家庭目标的选择。
          </p>
        </div>
        <div className="disclaimer">
          <ShieldCheck size={17} />
          <p>
            本工具不构成金融建议，未考虑提前还款手续费、罚息、还款间隔限制及未来 LPR
            调整。实际操作前请以贷款银行的最新规则为准。
          </p>
        </div>
      </div>
    </section>
  );
}
