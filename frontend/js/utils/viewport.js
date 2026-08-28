/** 视口适配模块：维持 375 × 700 的固定设计坐标系。 */
(function(CG){
  /**
   * 使用 contain 规则计算设备缩放比：宽度比例和高度比例取较小值。
   * 小屏缩小、大屏放大，画布始终保持 375:700，并在剩余空间内水平/垂直居中。
   * @returns {void}
   */
  function fit(){const stage=document.querySelector(".app-stage");if(!stage)return;const width=Math.max(1,window.innerWidth),height=Math.max(1,window.innerHeight);const scale=Math.min(width/CG.config.designWidth,height/CG.config.designHeight);stage.style.transform=`translate(-50%,-50%) scale(${scale})`}
  CG.viewport={fit};
  // 浏览器窗口和移动设备可视区变化时都重新计算，兼容旋转与地址栏高度变化。
  window.addEventListener("resize",fit);
  if(window.visualViewport)window.visualViewport.addEventListener("resize",fit);
})(window.CoffeeGame);
