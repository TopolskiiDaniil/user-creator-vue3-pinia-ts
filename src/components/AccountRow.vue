<script setup lang="ts">
import { QuestionFilled, Delete } from "@element-plus/icons-vue";
import type { Draft } from "../types/accountDraft";

const props = defineProps<{
  draft: Draft;
}>();

const emit = defineEmits<{
  (e: "commit", draft: Draft): void;
  (e: "type-change", draft: Draft): void;
  (e: "remove", id: string): void;
}>();

function handleCommit() {
  emit("commit", props.draft);
}

function handleTypeChange() {
  emit("type-change", props.draft);
}

function handleRemove() {
  emit("remove", props.draft.id);
}
</script>

<template>
  <div class="grid-row">
    <div class="cell">
      <el-form-item :error="draft.errors.meta" :show-message="true">
        <el-input
          v-model="draft.metaInput"
          placeholder="Например: work; admin"
          @blur="handleCommit"
          clearable
        >
          <template #suffix>
            <el-tooltip content="Разделяйте метки символом ;" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>
    </div>

    <div class="cell">
      <el-form-item :error="draft.errors.type" :show-message="true">
        <el-select
          v-model="draft.type"
          placeholder="Выберите"
          @change="handleTypeChange"
          style="width: 100%"
        >
          <el-option label="LDAP" value="ldap" />
          <el-option label="Локальная" value="local" />
        </el-select>
      </el-form-item>
    </div>

    <div class="cell" :class="{ 'cell-login-span': draft.type === 'ldap' }">
      <el-form-item :error="draft.errors.login" :show-message="true">
        <el-input
          v-model="draft.login"
          placeholder="Логин"
          @blur="handleCommit"
          clearable
        />
      </el-form-item>
    </div>

    <div v-if="draft.type === 'local'" class="cell">
      <el-form-item :error="draft.errors.password" :show-message="true">
        <el-input
          v-model="draft.passwordInput"
          placeholder="Пароль"
          show-password
          @blur="handleCommit"
        />
      </el-form-item>
    </div>

    <div class="cell-actions">
      <el-button
        type="danger"
        :icon="Delete"
        circle
        plain
        @click="handleRemove"
      />
    </div>
  </div>
</template>
