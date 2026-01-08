<template>
  <section id="contact" class="contact-section">
    <div class="container mx-auto">
      <div class="contact-header">
        <h2 class="contact-title">Contact Us</h2>
      </div>
      
      <div class="contact-image">
        <img src="/images/contact.svg" alt="Contact Us" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// No imports needed for this section
</script>

<style scoped>
.contact-section {
  @apply bg-white;
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  padding: 2rem 100px;
}

.contact-header {
  @apply text-center mb-16;
}

.contact-title {
  @apply text-4xl md:text-5xl font-bold text-primary mb-6;
}

.contact-image {
  width: 1000px;
  height: 428px;
  margin: 0 auto;
  overflow: hidden;
}

.contact-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.text-primary {
  color: #00A1FF;
}

@media (max-width: 1024px) {
  .contact-image {
    width: 90vw;
    max-width: 1000px;
    height: calc(90vw * 428 / 1000);
    max-height: 428px;
  }
}

@media (max-width: 768px) {
  .contact-section {
    padding: 2rem 1rem;
    min-height: auto;
  }

  .contact-header {
    margin-bottom: 2rem;
  }

  .contact-title {
    font-size: 1.875rem;
    margin-bottom: 1rem;
  }
  
  .contact-image {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 200px;
  }

  .contact-image img {
    object-fit: contain;
  }
}
</style>