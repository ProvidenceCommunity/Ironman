<template>
  <v-container fluid>
    <v-row style="height: 100%">
      <v-spacer></v-spacer>
      <v-col align-self="center" align="center" cols="6">
        <v-text-field label="Password" v-model="password" type="password" :hint="hint" persistent-hint></v-text-field>
        <v-btn @click="login">Login</v-btn>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {post} from "@/http";

export default defineComponent({
  name: "LocalLogin",
  data() {
    return {
      password: "",
      incorrectPassword: false
    }
  },
  methods: {
    async login() {
      try {
        const result = await post("/auth/local_login", {password: this.password});
        if (result.status === 204) {
          await this.$router.push("/");
        } else {
          this.incorrectPassword = true;
        }
      } catch {
        this.incorrectPassword = true;
      }
    }
  },
  computed: {
    hint() {
      if (this.password === "") {
        this.incorrectPassword = false;
        return "";
      } else if (this.incorrectPassword) {
        return "Incorrect password";
      } else {
        return "";
      }
    }
  }
})
</script>
