<script setup lang="ts">
import { computed, reactive } from "vue";
import { Delete, Plus, QuestionFilled } from "@element-plus/icons-vue";
import {
  useAccountsStore,
  type Account,
  type AccountType,
  type MetaTag,
} from "./stores/accounts";

type DraftErrors = Partial<
  Record<"meta" | "type" | "login" | "password", string>
>;

type Draft = {
  id: string;
  metaInput: string;
  type: AccountType;
  login: string;
  passwordInput: string;
  errors: DraftErrors;
};

const accountsStore = useAccountsStore();

function metaToInput(meta: MetaTag[]): string {
  return meta.map((t) => t.text).join("; ");
}

function parseMetaInput(raw: string): MetaTag[] {
  return raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => ({ text }));
}

function newId(): string {
  return crypto.randomUUID();
}

const drafts = reactive<Draft[]>(
  accountsStore.accounts.map((a) => ({
    id: a.id,
    metaInput: metaToInput(a.meta),
    type: a.type,
    login: a.login,
    passwordInput: a.password ?? "",
    errors: {},
  })),
);

const hasAnyRows = computed(() => drafts.length > 0);

function addDraft() {
  drafts.push({
    id: newId(),
    metaInput: "",
    type: "local",
    login: "",
    passwordInput: "",
    errors: {},
  });
}

function removeDraft(id: string) {
  const idx = drafts.findIndex((d) => d.id === id);
  if (idx !== -1) drafts.splice(idx, 1);
  accountsStore.removeAccount(id);
}

function validateDraft(d: Draft): boolean {
  const errors: DraftErrors = {};

  if (d.metaInput.length > 50) errors.meta = "Максимум 50 символов";

  if (!d.login.trim()) errors.login = "Обязательное поле";
  else if (d.login.length > 100) errors.login = "Максимум 100 символов";

  if (d.type === "local") {
    if (!d.passwordInput) errors.password = "Обязательное поле";
    else if (d.passwordInput.length > 100)
      errors.password = "Максимум 100 символов";
  }

  d.errors = errors;
  return Object.keys(errors).length === 0;
}

function commitDraft(d: Draft) {
  if (!validateDraft(d)) return;

  const account: Account = {
    id: d.id,
    meta: parseMetaInput(d.metaInput),
    type: d.type,
    login: d.login,
    password: d.type === "ldap" ? null : d.passwordInput,
  };

  accountsStore.upsertAccount(account);
}

function onTypeChange(d: Draft) {
  if (d.type === "ldap") d.passwordInput = "";
  commitDraft(d);
}
</script>

<template>
  <div class="page">
    <div class="section-card">
      <div class="title-row">
        <h2>Учетные записи</h2>
        <el-button type="primary" :icon="Plus" circle @click="addDraft" />
      </div>

      <el-alert
        type="info"
        show-icon
        :closable="false"
        title="Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;"
      />

      <div class="table">
        <div class="grid-header">
          <div>Метки</div>
          <div>Тип записи</div>
          <div>Логин</div>
          <div>Пароль</div>
          <div></div>
        </div>

        <div v-if="!hasAnyRows">Нажмите “+”, чтобы добавить учетную запись</div>

        <div v-for="d in drafts" :key="d.id" class="grid-row">
          <div class="cell">
            <el-form-item :error="d.errors.meta" :show-message="true">
              <el-input
                v-model="d.metaInput"
                placeholder="Например: work; admin"
                @blur="commitDraft(d)"
                clearable
              >
                <template #suffix>
                  <el-tooltip
                    content="Разделяйте метки символом ;"
                    placement="top"
                  >
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>
          </div>

          <div class="cell">
            <el-form-item :error="d.errors.type" :show-message="true">
              <el-select
                v-model="d.type"
                placeholder="Выберите"
                @change="onTypeChange(d)"
              >
                <el-option label="LDAP" value="ldap" />
                <el-option label="Локальная" value="local" />
              </el-select>
            </el-form-item>
          </div>

          <div class="cell" :class="{ 'cell-login-span': d.type === 'ldap' }">
            <el-form-item :error="d.errors.login" :show-message="true">
              <el-input
                v-model="d.login"
                placeholder="Значение"
                @blur="commitDraft(d)"
                clearable
              />
            </el-form-item>
          </div>

          <div v-if="d.type === 'local'" class="cell">
            <el-form-item :error="d.errors.password" :show-message="true">
              <el-input
                v-model="d.passwordInput"
                placeholder="Значение"
                show-password
                @blur="commitDraft(d)"
              />
            </el-form-item>
          </div>

          <div class="cell-actions">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              plain
              @click="removeDraft(d.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
