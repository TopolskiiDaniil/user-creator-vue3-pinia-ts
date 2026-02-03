<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { QuestionFilled, Delete, Check } from "@element-plus/icons-vue";
import type { Draft } from "../types/accountDraft";

const props = defineProps<{
  draft: Draft;
}>();

const emit = defineEmits<{
  (e: "commit", draft: Draft): void;
  (e: "mark-dirty", id: string): void;
  (e: "reset", id: string): void;
  (e: "remove", id: string): void;
}>();

const rowRef = ref<HTMLElement | null>(null);

function handleExplicitSave() {
  emit("commit", props.draft);
}

function handleFieldInput() {
  emit("mark-dirty", props.draft.id);
}

function handleTypeChange() {
  if (props.draft.type === "ldap") {
    props.draft.passwordInput = "";
  }
  emit("mark-dirty", props.draft.id);
}

function handleRemove() {
  emit("remove", props.draft.id);
}

function handleDocumentClick(event: MouseEvent) {
  const el = rowRef.value;
  if (!el) return;
  if (el.contains(event.target as Node)) return;
  if (!props.draft.isSaved) {
    emit("reset", props.draft.id);
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleDocumentClick);
});
</script>

<template>
  <div class="grid-row" ref="rowRef">
    <div class="cell">
      <el-form-item :error="draft.errors.meta" :show-message="true">
        <el-input
          v-model="draft.metaInput"
          placeholder="Например: work; admin"
          @input="handleFieldInput"
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
          placeholder="Укажите логин"
          @input="handleFieldInput"
          clearable
        />
      </el-form-item>
    </div>

    <div v-if="draft.type === 'local'" class="cell">
      <el-form-item :error="draft.errors.password" :show-message="true">
        <el-input
          v-model="draft.passwordInput"
          placeholder="Укажите пароль"
          show-password
          @input="handleFieldInput"
        />
      </el-form-item>
    </div>

    <div class="cell-actions">
      <el-button
        v-if="!draft.isSaved"
        type="success"
        :icon="Check"
        circle
        plain
        @click="handleExplicitSave"
      />
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
