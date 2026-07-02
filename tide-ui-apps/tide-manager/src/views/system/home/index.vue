<script setup lang="ts">
import { ref, computed } from 'vue'

defineOptions({ name: 'Home' })

const charImage = ref(
    new URL('@/assets/demoResources/4.png', import.meta.url).href
)

const demoImages = [
    new URL('@/assets/demoResources/1.png', import.meta.url).href,
    new URL('@/assets/demoResources/2.png', import.meta.url).href,
    new URL('@/assets/demoResources/3.png', import.meta.url).href,
    new URL('@/assets/demoResources/4.png', import.meta.url).href,
    new URL('@/assets/demoResources/5.png', import.meta.url).href,
    new URL('@/assets/demoResources/6.png', import.meta.url).href,
]

const threeViewItems = [
    { label: '正视图', img: demoImages[2] },
    { label: '侧视图', img: demoImages[2] },
    { label: '后视图', img: demoImages[2] },
    { label: '俯视图', img: demoImages[0] },
    { label: '仰视图', img: demoImages[1] },
    { label: '细节图', img: demoImages[3] },
]

const expressionItems = [
    { label: '好奇', img: demoImages[0] },
    { label: '思考', img: demoImages[0] },
    { label: '惊讶', img: demoImages[0] },
    { label: '眨眼', img: demoImages[0] },
    { label: '发光模式', img: demoImages[1] },
    { label: '开心', img: demoImages[1] },
    { label: '生气', img: demoImages[1] },
    { label: '害羞', img: demoImages[1] },
]

const threeViewIndex = ref(0)
const expressionIndex = ref(0)
const threeViewVisible = 3
const expressionVisible = 4

const threeViewMaxIndex = computed(() => Math.max(0, threeViewItems.length - threeViewVisible))
const expressionMaxIndex = computed(() => Math.max(0, expressionItems.length - expressionVisible))

function prevThreeView() {
    threeViewIndex.value = Math.max(0, threeViewIndex.value - 1)
}

function nextThreeView() {
    threeViewIndex.value = Math.min(threeViewMaxIndex.value, threeViewIndex.value + 1)
}

function prevExpression() {
    expressionIndex.value = Math.max(0, expressionIndex.value - 1)
}

function nextExpression() {
    expressionIndex.value = Math.min(expressionMaxIndex.value, expressionIndex.value + 1)
}

const multiFormItems = [
    { label: '学者形态', desc: '以知识为翼，洞察万物真理。', img: demoImages[0] },
    { label: '守护者形态', desc: '坚不可摧的意志，守护重要之人。', img: demoImages[1] },
    { label: '占卜师', desc: '窥见命运之线，预知未来之事。', img: demoImages[2] },
    { label: '幽灵', desc: '穿梭于虚实之间，无形亦无界。', img: demoImages[3] },
    { label: '古迹探索者', desc: '追寻远古遗迹，揭开尘封之谜。', img: demoImages[4] },
    { label: '暗夜行者', desc: '潜行于暗影之中，无声亦无形。', img: demoImages[0] },
    { label: '星辰使者', desc: '以星辰为引，照亮前行之路。', img: demoImages[1] },
]

const multiFormIndex = ref(0)
const multiFormVisible = 5
const multiFormMaxIndex = computed(() => Math.max(0, multiFormItems.length - multiFormVisible))

function prevMultiForm() {
    multiFormIndex.value = Math.max(0, multiFormIndex.value - 1)
}

function nextMultiForm() {
    multiFormIndex.value = Math.min(multiFormMaxIndex.value, multiFormIndex.value + 1)
}

const equipmentPlans = [
    { label: '方案A：经典款', img: demoImages[5] },
    { label: '方案B：学者款', img: demoImages[5] },
    { label: '方案C：未来款', img: demoImages[5] },
    { label: '方案D：古典款', img: demoImages[5] },
]
</script>

<template>
    <div class="design-first">
        <!-- 左侧主区域 -->
        <div class="design-first-left" :style="{ backgroundImage: `url(${charImage})` }">
            <!-- 标题区 -->
            <div class="charact-desc">
                <div class="design-title">百问兽</div>
                <div class="design-info">
                    <div class="info-row">
                        <span class="info-label">形态:</span>
                        <span class="info-value">猫头鹰</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">属性:</span>
                        <span class="info-value">智慧 / 幽灵</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">身高:</span>
                        <span class="info-value">0.38m</span>
                    </div>
                </div>
                <div class="design-desc">
                    <div class="desc-title">简介:</div>
                    <div class="desc-text">
                        百问兽喜欢收集世间的各种问题与知识，任何疑问都会在它的脑中转化为闪光的符文。它会通过眼镜观察世界，并将知识化为装备帮助训练家。
                    </div>
                </div>
            </div>

            <!-- 配色方案 -->
            <!-- <div class="design-palette">
                <div class="palette-title">配色方案</div>
                <div class="palette-colors">
                    <div class="color-swatch" style="background: #1a1a2e"></div>
                    <div class="color-swatch" style="background: #4a3f6b"></div>
                    <div class="color-swatch" style="background: #6b5b95"></div>
                    <div class="color-swatch" style="background: #9b89c4"></div>
                    <div class="color-swatch" style="background: #c4a8e8"></div>
                    <div class="color-swatch" style="background: #7b2cbf"></div>
                    <div class="color-swatch" style="background: #9d4edd"></div>
                    <div class="color-swatch" style="background: #d4a574"></div>
                </div>
            </div> -->

            <!-- 竖排文字装饰 -->
            <div class="vertical-text">
                <span>「世间万物皆有问，答案就在下一次眨眼之间。」</span>
            </div>
        </div>
        <div class="design-first-center">
            <!-- 三视图 -->
            <div class="design-section">
                <div class="section-title">三视图</div>
                <div class="carousel-wrapper">
                    <button class="carousel-arrow carousel-arrow--left"
                        :class="{ 'carousel-arrow--disabled': threeViewIndex === 0 }" @click="prevThreeView">
                        ‹
                    </button>
                    <div class="carousel-viewport">
                        <div class="carousel-track" :style="{
                            transform: `translateX(-${threeViewIndex * (100 / threeViewVisible)}%)`,
                            '--visible-count': threeViewVisible,
                        }">
                            <div v-for="(item, idx) in threeViewItems" :key="idx" class="carousel-item"
                                :style="{ flex: `0 0 calc(100% / ${threeViewVisible})` }">
                                <div class="view-item">
                                    <div class="view-label">{{ item.label }}</div>
                                    <img :src="item.img" :alt="item.label" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="carousel-arrow carousel-arrow--right"
                        :class="{ 'carousel-arrow--disabled': threeViewIndex >= threeViewMaxIndex }"
                        @click="nextThreeView">
                        ›
                    </button>
                </div>
            </div>
            <!-- 表情设定 -->
            <div class="design-section">
                <div class="section-title">表情设定</div>
                <div class="carousel-wrapper">
                    <button class="carousel-arrow carousel-arrow--left"
                        :class="{ 'carousel-arrow--disabled': expressionIndex === 0 }" @click="prevExpression">
                        ‹
                    </button>
                    <div class="carousel-viewport">
                        <div class="carousel-track" :style="{
                            transform: `translateX(-${expressionIndex * (100 / expressionVisible)}%)`,
                            '--visible-count': expressionVisible,
                        }">
                            <div v-for="(item, idx) in expressionItems" :key="idx" class="carousel-item"
                                :style="{ flex: `0 0 calc(100% / ${expressionVisible})` }">
                                <div class="expression-item">
                                    <img :src="item.img" :alt="item.label" />
                                    <div class="expression-label">{{ item.label }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="carousel-arrow carousel-arrow--right"
                        :class="{ 'carousel-arrow--disabled': expressionIndex >= expressionMaxIndex }"
                        @click="nextExpression">
                        ›
                    </button>
                </div>
            </div>
        </div>
        <!-- 右侧区域 -->
        <div class="design-first-right">


            <!-- 装备形态 -->
            <div class="design-section">
                <div class="section-title">变形：装备形态 [眼镜]</div>
                <div class="equipment-layout">
                    <div class="equipment-main">
                        <img src="@/assets/demoResources/6.png" alt="装备形态" />
                    </div>
                    <div class="equipment-desc">
                        <div class="desc-label">设计说明</div>
                        <div class="desc-content">
                            百问兽将自身知识凝聚成「智慧之镜」，佩戴者可获得洞察与思考的力量。
                        </div>
                    </div>
                </div>
            </div>



            <!-- 变形过程 -->
            <div class="design-section">
                <div class="section-title">变形过程示意</div>
                <div class="transform-process">
                    <div class="transform-step">
                        <img src="@/assets/demoResources/3.png" alt="形态1" />
                    </div>
                    <div class="transform-arrow">→</div>
                    <div class="transform-step">
                        <img src="@/assets/demoResources/5.png" alt="形态2" />
                    </div>
                    <div class="transform-arrow">→</div>
                    <div class="transform-step">
                        <img src="@/assets/demoResources/6.png" alt="形态3" />
                    </div>
                </div>
                <div class="equipment-subtitle">眼镜设计方案</div>
            </div>
        </div>
    </div>

    <div class="design-second">
        <div class="design-section design-second__multi-form">
            <div class="section-title">多形态设计</div>
            <div class="carousel-wrapper">
                <button class="carousel-arrow carousel-arrow--left"
                    :class="{ 'carousel-arrow--disabled': multiFormIndex === 0 }" @click="prevMultiForm">
                    ‹
                </button>
                <div class="carousel-viewport">
                    <div class="carousel-track" :style="{
                        transform: `translateX(-${multiFormIndex * (100 / multiFormVisible)}%)`,
                        '--visible-count': multiFormVisible,
                    }">
                        <div v-for="(item, idx) in multiFormItems" :key="idx" class="carousel-item"
                            :style="{ flex: `0 0 calc(100% / ${multiFormVisible})` }">
                            <div class="multi-form-card">
                                <div class="multi-form-card__image">
                                    <img :src="item.img" :alt="item.label" />
                                </div>
                                <div class="multi-form-card__name">{{ item.label }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="carousel-arrow carousel-arrow--right"
                    :class="{ 'carousel-arrow--disabled': multiFormIndex >= multiFormMaxIndex }" @click="nextMultiForm">
                    ›
                </button>
            </div>
        </div>

        <div class="design-section design-second__equipment">
            <div class="section-title">装备设计方案</div>
            <div class="equipment-grid">
                <div v-for="(plan, idx) in equipmentPlans" :key="idx" class="equipment-card">
                    <div class="equipment-card__image">
                        <img :src="plan.img" :alt="plan.label" />
                    </div>
                    <div class="equipment-card__label">{{ plan.label }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.design-first {
    display: flex;
    gap: 16px;
    // padding: 16px;
    font-family: "Microsoft YaHei", sans-serif;

    .design-first-left {
        width: 34%;
        display: flex;
        position: relative;
        overflow: hidden;
        background-size: contain;
        background-position: right bottom;
        background-repeat: no-repeat;
        // animation: float-bg 4s ease-in-out infinite;

        .charact-desc {
            position: relative;

            .design-title {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: 12px;
            }

            .design-info {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-bottom: 12px;

                .info-row {
                    font-size: 13px;

                    .info-label {
                        color: #000000;
                        font-weight: 600;
                        margin-right: 8px;
                        letter-spacing: 8px;
                    }

                    .info-value {
                        color: #2a1810;
                        letter-spacing: 2px;

                    }

                }

            }

            .design-desc {

                .desc-title {
                    color: #000000;
                    font-weight: 600;
                    margin-bottom: 8px;
                    font-size: 13px;
                    letter-spacing: 8px;
                }

                .desc-text {
                    width: 40%;
                    font-size: 11px;
                    line-height: 28px;
                    letter-spacing: 2px;
                    color: #3a2818;
                }

            }


        }

    }

    .design-first-center {
        width: 30%;
    }

    .design-first-right {
        width: 36%;
    }

}




.design-palette {
    background: rgba(255, 250, 240, 0.95);
    padding: 12px 16px;
}

.palette-title {
    font-size: 12px;
    color: #8b6914;
    margin-bottom: 8px;
}

.palette-colors {
    display: flex;
    gap: 6px;
}

.color-swatch {
    width: 24px;
    height: 24px;
}

.vertical-text {
    position: absolute;
    right: 6px;
    top: 4px;
    font-size: 11px;
    color: #814819;
    writing-mode: vertical-rl;
    letter-spacing: 2px;
    opacity: 0.55;
    pointer-events: none;
    z-index: 2;

    span {
        display: block;
    }
}

/* 右侧 */
.design-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.design-section {
    padding: 16px 20px;
}

.section-title {
    font-size: 15px;
    font-weight: bold;
    color: #2a1810;
    margin-bottom: 12px;
    padding-left: 12px;
    // border-left: 3px solid #7b2cbf;
    letter-spacing: 2px;
}

/* 轮播组件 */
.carousel-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
}

.carousel-viewport {
    flex: 1;
    overflow: hidden;
}

.carousel-track {
    display: flex;
    align-items: stretch;
    transition: transform 0.35s ease;
}

.carousel-item {
    padding: 0 6px;
    box-sizing: border-box;
    display: flex;
}

.carousel-arrow {
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    border: 1px solid #d4a574;
    border-radius: 50%;
    color: #7b2cbf;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover:not(.carousel-arrow--disabled) {
        background: #7b2cbf;
        color: #fff;
        border-color: #7b2cbf;
    }

    &--disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
}

/* 三视图 */
.view-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;

    img {
        width: 100%;
        aspect-ratio: 1;
        object-fit: contain;
    }
}

.view-label {
    font-size: 12px;
    color: #8b6914;
    text-align: center;
    width: 100%;
}

/* 装备形态 */
.equipment-layout {
    display: flex;
    gap: 20px;
}

.equipment-main {
    flex: 0 0 60%;

    img {
        width: 100%;
    }
}

.equipment-desc {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 8px;
}

.desc-label {
    font-size: 12px;
    font-weight: bold;
    padding-bottom: 6px;
}

.desc-content {
    font-size: 12px;
    line-height: 1.8;
}

/* 表情设定 */
.expression-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;

    img {
        width: 100%;
        aspect-ratio: 1;
        object-fit: contain;
    }
}

.expression-label {
    font-size: 11px;
    color: #8b6914;
    text-align: center;
    width: 100%;
}

/* 变形过程 */
.transform-process {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.transform-step {
    flex: 1;

    img {
        width: 100%;
        aspect-ratio: 1;
        object-fit: contain;
    }
}

.transform-arrow {
    font-size: 24px;
    font-weight: bold;
}

.equipment-subtitle {
    text-align: center;
    font-size: 12px;
    padding-top: 8px;
}

/* ========== design-second ========== */
.design-second {
    display: flex;
    gap: 16px;
    margin-top: 16px;

    .design-second__multi-form {
        flex: 0 0 65%;
    }

    .design-second__equipment {
        flex: 0 0 35%;
    }
}

/* 多形态设计 */
.multi-form-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.multi-form-card__image {
    width: 100%;

    img {
        width: 100%;
        aspect-ratio: 3 / 4;
        object-fit: contain;
        border-radius: 6px;
    }
}

.multi-form-card__name {
    font-size: 13px;
    font-weight: bold;
    color: #2a1810;
    text-align: center;
    letter-spacing: 2px;
}


/* 装备设计方案 */
.equipment-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.equipment-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 8px;
    transition: all 0.2s;

    &:hover {
        border-color: #7b2cbf;
        box-shadow: 0 2px 8px rgba(123, 44, 191, 0.15);
    }
}

.equipment-card__image {
    width: 60%;

    img {
        width: 100%;
        aspect-ratio: 1;
        object-fit: contain;
    }
}

.equipment-card__label {
    font-size: 12px;
    color: #2a1810;
    font-weight: 600;
    text-align: center;
    letter-spacing: 1px;
}

/* ========== 动态动画 ========== */
@keyframes float-bg {

    0%,
    100% {
        background-position: right bottom;
    }

    50% {
        background-position: right calc(100% + 8px);
    }
}

@keyframes glow-pulse {

    0%,
    100% {
        opacity: 0.3;
    }

    50% {
        opacity: 0.8;
    }
}

@keyframes float-text {

    0%,
    100% {
        transform: translateY(-50%) translateX(0);
    }

    50% {
        transform: translateY(-50%) translateX(-8px);
    }
}
</style>