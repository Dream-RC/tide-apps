<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icon } from '@/components/chronos-ui/Icon'
import { useFormDesignerStore } from '@/store/modules/formDesigner'

const formDesignerStore = useFormDesignerStore()

// 编辑器状态
const editorContent = ref('')
const language = ref('vue')
const theme = ref('vs-dark')
const editorRef = ref()

// 计算属性
const currentForm = computed(() => formDesignerStore.currentForm)

// 初始化编辑器内容
const initializeEditor = () => {
  if (currentForm.value.components.length > 0) {
    editorContent.value = formDesignerStore.generateVueCode()
  } else {
    editorContent.value = `<!-- Vue组件模板示例 -->
<template>
  <form :model="form" class="form-container">
    <div class="form-item">
      <label class="form-label">用户名</label>
      <input v-model="form.username" placeholder="请输入用户名" class="form-input" />
    </div>
    
    <div class="form-item">
      <label class="form-label">邮箱</label>
      <input v-model="form.email" type="email" placeholder="请输入邮箱" class="form-input" />
    </div>
    
    <div class="form-item">
      <button type="button" class="submit-btn" @click="onSubmit">提交</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  username: '',
  email: ''
})

const onSubmit = () => {
  console.log('表单数据:', form.value)
}
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.submit-btn {
  padding: 8px 16px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>`
  }
}

// 保存代码
const saveCode = () => {
  const blob = new Blob([editorContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `form-component.${language.value === 'vue' ? 'vue' : language.value}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast.success('代码已保存到本地')
}

// 复制代码到剪贴板
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(editorContent.value)
    toast.success('代码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    toast.error('复制失败，请手动选择复制')
  }
}

// 格式化代码
const formatCode = () => {
  toast.info('格式化功能暂时不可用')
}

// 从表单设计器同步代码
const syncFromDesigner = () => {
  if (currentForm.value.components.length > 0) {
    editorContent.value = formDesignerStore.generateVueCode()
    toast.success('已同步表单设计器的代码')
  } else {
    toast.warning('表单设计器中暂无内容')
  }
}

// 组件挂载时初始化编辑器
onMounted(() => {
  initializeEditor()
})
</script>

<template>
  <div class="drawer-code-editor">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <Select 
          v-model="language" 
          class="w-[100px]"
          size="sm"
        >
          <SelectTrigger>
            <SelectValue placeholder="选择语言" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vue">Vue</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          v-model="theme" 
          class="w-[100px] ml-2"
          size="sm"
        >
          <SelectTrigger>
            <SelectValue placeholder="选择主题" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vs-dark">暗色主题</SelectItem>
            <SelectItem value="vs">亮色主题</SelectItem>
            <SelectItem value="hc-black">高对比度</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div class="toolbar-right">
        <Button variant="outline" size="sm" @click="syncFromDesigner" title="同步设计器">
          <Icon icon="lucide:refresh-cw" class="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" @click="formatCode" title="格式化代码">
          <Icon icon="lucide:refresh-cw" class="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" @click="copyCode" title="复制代码">
          <Icon icon="lucide:copy" class="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" @click="saveCode" title="保存代码">
          <Icon icon="lucide:download" class="w-4 h-4" />
        </Button>
      </div>
    </div>
    
    <div class="editor-wrapper">
      <textarea
        v-model="editorContent"
        rows="30"
        placeholder="生成的代码将显示在这里..."
        class="code-textarea"
        readonly
      />
    </div>
  </div>
</template>

<style scoped>
.drawer-code-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
  flex-shrink: 0;
  width: 100%;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  gap: 4px;
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  width: 100%;
}

.code-textarea {
  width: 100%;
  height: 100%;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border: none;
  resize: none;
  padding: 12px;
  box-sizing: border-box;
}

.code-textarea::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-textarea::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.code-textarea::-webkit-scrollbar-thumb {
  background: #4d4d4d;
  border-radius: 4px;
}

.code-textarea::-webkit-scrollbar-thumb:hover {
  background: #5d5d5d;
}
</style>
