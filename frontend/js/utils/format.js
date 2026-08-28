/** UI 数值格式化模块：集中处理货币、单位、百分比、品质档位和变化趋势文案。 */
(function(CG){
  /** 为数值添加正负号和单位，同时保留最多一位小数。 */
  const signed=(n,unit="")=>`${n>0?"+":""}${Number.isInteger(n)?n:Math.round(n*10)/10}${unit}`;
  CG.format={
    /** 格式化为不显示小数的人民币。 */
    money(n){return new Intl.NumberFormat("zh-CN",{style:"currency",currency:"CNY",maximumFractionDigits:0}).format(n)},
    /** 按指定最大小数位格式化普通数字。 */
    number(n,digits=0){return new Intl.NumberFormat("zh-CN",{maximumFractionDigits:digits}).format(n)},
    /** 格式化公斤产量。 */
    kg(n){return `${this.number(n,0)}kg`},
    /** 把 0–1 比例格式化为百分数。 */
    percent(n,digits=0){return `${(n*100).toFixed(digits)}%`},
    /** 格式化带明确正负号的人民币差值。 */
    signedMoney(n){return `${n>=0?"+":"-"}¥${this.number(Math.abs(n),0)}`},
    /** 转义即将插入 innerHTML/HTML 属性的外部文本，防止排行榜昵称造成脚本注入。 */
    html(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char])},
    signed,
    /** 把后台 0–100 风味/纯净度转换为五档圆点和中文标签，避免泄露精确值。 */
    quality(value,type){const levels=value<50?[1,type==="potential"?"薄弱":"混杂"]:value<65?[2,type==="potential"?"平淡":"一般"]:value<75?[3,type==="potential"?"良好":"尚净"]:value<85?[4,type==="potential"?"馥郁":"纯净"]:[5,type==="potential"?"卓越":"极净"];return {level:levels[0],label:levels[1]}},
    /** 按资源类型把原始差值转成货币、单位或方向箭头。 */
    deltaText(key,value){if(!value)return"持平";const map={gold:"¥",yield:"kg",health:"%"};if(key==="gold")return this.signedMoney(value);if(key==="yield"||key==="health")return signed(Math.round(value),map[key]);return value>8?"↑↑":value>0?"↑":value<-8?"↓↓":value<0?"↓":"—"}
  };
})(window.CoffeeGame);
