<script setup lang="ts">
defineOptions({
  name: "AuthLayout",
});
</script>

<template>
  <section
    aria-label="Auth section"
    class="w-screen min-h-screen flex bg-cover bg-center bg-no-repeat justify-center items-center auth__bg my-8"
  >
    <div
      class="flex bg-white justify-center flex-col w-lg items-center shadow-lg rounded-xl px-8 py-8"
    >
      <div class="flex flex-col items-center">
        <img
          src="@/assets/images/logo.png"
          srcset="
            @/assets/images/logo.png     1x,
            @/assets/images/logo--2x.png 2x,
            @/assets/images/logo--3x.png 3x
          "
          alt="Diginex logo"
          class="w-32 h-32"
        />
        <h4 class="text-center text-md mb-4 text-blue-700">
          Enabling companies to collect, evaluate
          <br />
          and share sustainability data through easy-to-use software
        </h4>
      </div>
      <router-view></router-view>
    </div>
  </section>
</template>

<style lang="scss">
@use "@/assets/stylesheets/components/form";
.auth__bg {
  background-image: url("@/assets/images/auth-bg.png");
}
</style>
