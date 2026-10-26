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
          以当前剩余本金和剩余期数为起点，支持等额本息与等额本金两种还款方式。提前还款视为即时冲抵本金，结清日期按下一期还款日逐月顺延，所有参数均在浏览器本地计算。实际银行可能因日计息、违约金、利率重定价与取整规则产生差异。
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
          <h3>两种还款方式</h3>
          <p>
            等额本息月供固定；等额本金每月归还固定本金 P/n，利息随余额递减，首月月供最高、之后逐月下降。
          </p>
        </article>
        <article>
          <span className="method-icon">
            <CalendarClock size={18} />
          </span>
          <h3>缩短月供</h3>
          <p>
            期限保持不变。等额本息按剩余本金重算月供；等额本金降低每月应还本金，月供仍逐月递减。
          </p>
        </article>
        <article>
          <span className="method-icon">
            <FileText size={18} />
          </span>
          <h3>缩短年限</h3>
          <p>
            等额本息维持原月供；等额本金维持每月本金。两种方式都会压缩期数，末期金额按余额调整。
          </p>
        </article>
      </div>

      <div className="methodology-note">
        <div>
          <span>
            <CircleHelp size={15} />
            为什么两种方式省息不同？
          </span>
          <p>
            提前还款减少的是本金。缩短年限让每月还款额（或每月本金）保持较高水平，本金下降更快，利息自然更少；缩短月供则把降下来的本金转化为每月现金流。没有绝对最优，只有更匹配家庭目标的选择。
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
