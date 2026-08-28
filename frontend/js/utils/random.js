/**
 * 可测试随机数模块。
 * 正常运行优先使用 Web Crypto；`?rng=0.1,0.9` 或 use() 可注入确定序列以复现事件。
 */
(function(CG){
  // URL 注入队列仅接受 [0,1) 内的有限数字。
  const query=new URLSearchParams(window.location.search).get("rng");
  let queue=query?query.split(",").map(Number).filter(n=>Number.isFinite(n)&&n>=0&&n<1):[];
  CG.random={
    /** 获取下一个 [0,1) 随机数：注入队列 → Web Crypto → Math.random。 */
    value(){if(queue.length)return queue.shift();if(window.crypto&&crypto.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}return Math.random()},
    /** 用给定数组替换随机队列，供单元测试和问题复现使用。 */
    use(values){queue=values.slice()},
    /** 清空注入序列，让后续调用恢复真实随机源。 */
    clear(){queue=[]}
  };
})(window.CoffeeGame);
