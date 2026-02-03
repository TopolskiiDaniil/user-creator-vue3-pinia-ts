<script setup lang="ts">
import { computed, reactive } from "vue";
import { Plus } from "@element-plus/icons-vue";
import {
  useAccountsStore,
  type Account,
  type MetaTag,
} from "../stores/accounts";
import AccountRow from "./AccountRow.vue";
import type { Draft, DraftErrors } from "../types/accountDraft";

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

        <div
          v-if="!hasAnyRows"
          style="padding: 10px 6px; color: #6b7280; font-size: 13px"
        >
          Нажмите “+”, чтобы добавить учетную запись
        </div>

        <AccountRow
          v-for="d in drafts"
          :key="d.id"
          :draft="d"
          @commit="commitDraft"
          @type-change="onTypeChange"
          @remove="removeDraft"
        />
      </div>
    </div>
  </div>
</template>
