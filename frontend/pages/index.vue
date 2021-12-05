<template>
  <div class="wrap">
    <h1>
      nslookup
    </h1>
    <form
      action=""
      onSubmit="return false"
      class="form"
    >
      <p class="error">
        {{ error }}
      </p>
      <label for="domain" class="form__label">ドメイン名</label>
      <input
        id="domain"
        v-model="domain"
        type="text"
        name="domain"
        class="form__input"
      >
      <input
        type="submit"
        value="確認する"
        class="form__input"
        @click="checkIP"
      >
    </form>
    <div v-if="address" class="result">
      <h2>
        検索結果
      </h2>
      <p class="result__domain">
        ドメイン名 : {{ resultDomain }}
      </p>
      <p class="result__address">
        IPアドレス : {{ address }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      domain: '',
      resultDomain: '',
      address: '',
      error: ''
    }
  },
  methods: {
    checkIP () {
      const url = `https://${process.env.fqdn}/api/v1/nslookup`
      const params = {
        params: {
          domain: this.domain
        }
      }
      this.$axios.get(url, params)
        .then((response) => {
          this.resultDomain = this.domain
          this.address = response.data
          this.error = ''
        })
        .catch(() => {
          this.resultDomain = ''
          this.address = ''
          this.error = '入力内容を再度ご確認下さい'
        })
    }
  }
}
</script>

<style>
.wrap {
  max-width: 300px;
  margin: 0 auto;
}

.error {
  color: red;
}

.form {
  display: flex;
  flex-direction: column;
}

.form__label,
.form__input {
  padding: 8px;
  margin-bottom: 8px;
}

.result__domain,
.result__address {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 8px;
}
</style>
