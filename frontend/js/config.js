/**
 * 全局运行配置模块。
 * 创建唯一的 `window.CoffeeGame` 命名空间，并提供设计画布、后端地址和本地存储前缀。
 */
(function(){
  window.CoffeeGame=window.CoffeeGame||{};
  window.CoffeeGame.config={
    designWidth:375,
    designHeight:700,
    supabaseUrl:"https://vviexdnhrvpkybvpzhte.supabase.co",
    supabasePublishableKey:"sb_publishable_xH1GwVIe1jsLaA8Lj-jwtQ_oA3AGTib",
    storagePrefix:"nanjian-coffee-v1",
    initialGold:30000,
    optionCostMultiplier:20,
    fixedDepreciation:800,
    debtRepaymentMultiplier:1.2
  };
})();

