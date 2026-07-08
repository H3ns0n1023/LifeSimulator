<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';

const store = useGameStore();

// 当前可用货币（学生用零花钱，成年用存款）
const isStudent = computed(() => store.state?.employment === 'student');
const balance = computed(() => {
  if (!store.state) return 0;
  return isStudent.value ? store.state.allowance : store.state.savings;
});
const balanceLabel = computed(() => (isStudent.value ? '零花钱' : '存款'));

function fmt(yuan: number): string {
  if (yuan >= 10000) return `${(yuan / 10000).toFixed(1)} 万`;
  return `${yuan} 元`;
}

// 彩票是否今年已买
function lotteryBought(): boolean {
  return !!store.state?.flags.has('lottery_bought_this_year');
}

// 某商品是否可购买（余额够 + 彩票未重复买）
function canBuy(itemId: string, price: number): boolean {
  if (balance.value < price) return false;
  if (itemId === 'lottery' && lotteryBought()) return false;
  return true;
}

function buy(itemId: string) {
  store.buyItem(itemId);
}

function back() {
  store.setView('game');
}
</script>

<template>
  <div v-if="store.state" class="shop-view">
    <header class="topbar">
      <button class="back" @click="back">← 返回</button>
      <span>🛒 商店</span>
      <span class="balance">{{ balanceLabel }}：{{ fmt(balance) }}</span>
    </header>

    <div v-if="store.shopMessage" class="toast">{{ store.shopMessage }}</div>

    <div class="goods">
      <div v-for="item in store.shopItems" :key="item.id" class="good-card">
        <div class="good-head">
          <strong>{{ item.name }}</strong>
          <span class="price">{{ fmt(item.price) }}</span>
        </div>
        <p class="desc">{{ item.desc }}</p>
        <div class="good-foot">
          <span v-if="item.id === 'lottery' && lotteryBought()" class="sold">已购买，等年底开奖</span>
          <span v-else-if="balance < item.price" class="poor">余额不足</span>
          <button v-else @click="buy(item.id)">购买</button>
        </div>
      </div>
    </div>

    <p class="tip">提示：学生期用零花钱购买，成年后用存款。彩票每年底开奖一次（头奖 50 万，千分之一概率）。</p>
  </div>
</template>

<style scoped>
.shop-view { display: flex; flex-direction: column; height: 100vh; background: #f9f9f9; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem;
  background: #8e44ad; color: white; }
.back { background: none; border: none; color: white; cursor: pointer; font-size: 1rem; }
.balance { font-weight: bold; }
.toast { margin: 0.75rem 1rem 0; padding: 0.6rem 1rem; background: #fff3cd; border-left: 4px solid #f39c12;
  border-radius: 3px; }
.goods { flex: 1; overflow-y: auto; padding: 1rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
.good-card { background: white; border: 1px solid #eee; border-radius: 6px; padding: 0.85rem; display: flex; flex-direction: column; }
.good-head { display: flex; justify-content: space-between; align-items: center; }
.price { color: #c0392b; font-weight: bold; }
.desc { color: #666; font-size: 0.85rem; margin: 0.5rem 0; flex: 1; }
.good-foot { margin-top: 0.5rem; }
.good-foot button { padding: 0.4rem 1.2rem; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer; }
.good-foot button:hover { background: #2ecc71; }
.sold { color: #888; font-size: 0.85rem; }
.poor { color: #e74c3c; font-size: 0.85rem; }
.tip { padding: 0.75rem 1rem; color: #888; font-size: 0.8rem; border-top: 1px solid #ddd; }
</style>
